//
// Copyright © 2023, 2024 Hardcore Engineering Inc.
//
// Licensed under the Eclipse Public License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License. You may
// obtain a copy of the License at https://www.eclipse.org/legal/epl-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//
// See the License for the specific language governing permissions and
// limitations under the License.
//

import activity, { DocUpdateMessage } from '@hcengineering/activity'
import { Analytics } from '@hcengineering/analytics'
import { loadCollabJson, loadCollabYdoc, saveCollabJson, saveCollabYdoc } from '@hcengineering/collaboration'
import { decodeDocumentId } from '@hcengineering/collaborator-client'
import core, { AttachedData, MeasureContext, Ref, Space, TxOperations } from '@hcengineering/core'
import { StorageAdapter } from '@hcengineering/server-core'
import { areEqualMarkups } from '@hcengineering/text'
import { markupToYDoc } from '@hcengineering/text-ydoc'
import { Doc as YDoc } from 'yjs'

import { Context } from '../context'
import { CollabStorageAdapter } from './adapter'

export interface PlatformStorageAdapterOptions {
  retryCount?: number
  retryInterval?: number
}
export class PlatformStorageAdapter implements CollabStorageAdapter {
  private readonly retryCount: number
  private readonly retryInterval: number

  constructor (
    private readonly storage: StorageAdapter,
    options: PlatformStorageAdapterOptions = {}
  ) {
    this.retryCount = options.retryCount ?? 5
    this.retryInterval = options.retryInterval ?? 50
  }

  async loadDocument (ctx: MeasureContext, documentName: string, context: Context): Promise<YDoc | undefined> {
    const { content, wsIds } = context
    const { documentId } = decodeDocumentId(documentName)

    // try to load document content
    try {
      ctx.info('load document content', { documentName })

      const ydoc = await ctx.with('loadCollabYdoc', {}, (ctx) => {
        return withRetry(
          ctx,
          this.retryCount,
          () => {
            return loadCollabYdoc(ctx, this.storage, wsIds, documentId)
          },
          this.retryInterval
        )
      })

      if (ydoc !== undefined) {
        ctx.info('loaded from storage', { documentName })
        return ydoc
      }
    } catch (err: any) {
      Analytics.handleError(err)
      ctx.error('failed to load document content', { documentName, error: err })
      throw err
    }

    // then try to load from inital content
    if (content !== undefined) {
      try {
        ctx.info('load document initial content', { documentName, content })

        const markup = await ctx.with('loadCollabJson', {}, (ctx) => {
          return withRetry(ctx, 5, () => {
            return loadCollabJson(ctx, this.storage, wsIds, content)
          })
        })
        if (markup !== undefined) {
          const ydoc = markupToYDoc(markup, documentId.objectAttr)

          // if document was loaded from the initial content or storage we need to save
          // it to ensure the next time we load it from the ydoc document
          await saveCollabYdoc(ctx, this.storage, wsIds, documentId, ydoc)

          ctx.info('loaded from initial content', { documentName, content })
          return ydoc
        }
      } catch (err: any) {
        Analytics.handleError(err)
        ctx.error('failed to load initial document content', { documentName, content, error: err })
        throw err
      }
    }

    // nothing found
    return undefined
  }

  async saveDocument (
    ctx: MeasureContext,
    documentName: string,
    document: YDoc,
    context: Context,
    getMarkup: {
      prev: () => Record<string, string>
      curr: () => Record<string, string>
    }
  ): Promise<Record<string, string> | undefined> {
    const { clientFactory, wsIds } = context
    const { documentId } = decodeDocumentId(documentName)

    try {
      ctx.info('save document ydoc content', { documentName })
      await ctx.with('saveCollabYdoc', {}, (ctx) => {
        return withRetry(
          ctx,
          this.retryCount,
          () => {
            return saveCollabYdoc(ctx, this.storage, wsIds, documentId, document)
          },
          this.retryInterval
        )
      })
    } catch (err: any) {
      Analytics.handleError(err)
      ctx.error('failed to save document ydoc content', { documentName, error: err })
      // raise an error if failed to save document to storage
      // this will prevent document from being unloaded from memory
      throw err
    }

    let client: TxOperations
    try {
      client = await ctx.with('connect', {}, () => clientFactory())
    } catch (err: any) {
      Analytics.handleError(err)
      ctx.error('failed to connect to platform', { documentName, error: err })
      throw err
    }

    try {
      ctx.info('save document content to platform', { documentName })
      return await ctx.with('save-to-platform', {}, (ctx) => {
        return this.saveDocumentToPlatform(ctx, client, context, documentName, getMarkup)
      })
    } finally {
      await client.close()
    }
  }

  async saveDocumentToPlatform (
    ctx: MeasureContext,
    client: Omit<TxOperations, 'close'>,
    context: Context,
    documentName: string,
    getMarkup: {
      prev: () => Record<string, string>
      curr: () => Record<string, string>
    }
  ): Promise<Record<string, string> | undefined> {
    const { wsIds } = context
    const { documentId } = decodeDocumentId(documentName)
    const { objectAttr, objectClass, objectId } = documentId

    const attribute = client.getHierarchy().findAttribute(objectClass, objectAttr)
    if (attribute === undefined) {
      ctx.warn('attribute not found', { documentName, objectClass, objectAttr })
      return
    }

    const markup = {
      prev: getMarkup.prev(),
      curr: getMarkup.curr()
    }

    const currMarkup = markup.curr[objectAttr]
    const prevMarkup = markup.prev[objectAttr]

    if (areEqualMarkups(currMarkup, prevMarkup)) {
      ctx.info('markup not changed, skip platform update', { documentName })
      return
    }

    const current = await ctx.with('query', {}, () => {
      return client.findOne(objectClass, { _id: objectId })
    })

    if (current === undefined) {
      ctx.warn('document not found', { documentName, objectClass, objectId })
      return
    }

    const hierarchy = client.getHierarchy()
    if (!hierarchy.isDerived(attribute.type._class, core.class.TypeCollaborativeDoc)) {
      ctx.warn('unsupported attribute type', { documentName, objectClass, objectAttr })
      return
    }

    const blobId = await ctx.with('saveCollabJson', {}, (ctx) => {
      return withRetry(
        ctx,
        this.retryCount,
        () => {
          return saveCollabJson(ctx, this.storage, wsIds, documentId, markup.curr[objectAttr])
        },
        this.retryInterval
      )
    })

    await ctx.with('update', {}, () => client.diffUpdate(current, { [objectAttr]: blobId }))

    await ctx.with('activity', {}, () => {
      const space = hierarchy.isDerived(current._class, core.class.Space) ? (current._id as Ref<Space>) : current.space

      const data: AttachedData<DocUpdateMessage> = {
        objectId,
        objectClass,
        action: 'update',
        attributeUpdates: {
          attrKey: objectAttr,
          attrClass: core.class.TypeMarkup,
          prevValue: prevMarkup,
          set: [currMarkup],
          added: [],
          removed: [],
          isMixin: hierarchy.isMixin(objectClass)
        }
      }
      return client.addCollection(
        activity.class.DocUpdateMessage,
        space,
        current._id,
        current._class,
        'docUpdateMessages',
        data
      )
    })

    return markup.curr
  }
}

async function withRetry<T> (
  ctx: MeasureContext,
  retries: number,
  op: () => Promise<T>,
  delay: number = 100
): Promise<T> {
  let error: any
  while (retries > 0) {
    retries--
    try {
      return await op()
    } catch (err: any) {
      error = err
      ctx.info('error', { err, retries })
      if (retries !== 0) {
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }
  throw error
}
