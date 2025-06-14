<!--
// Copyright © 2020, 2021 Anticrm Platform Contributors.
// Copyright © 2021 Hardcore Engineering Inc.
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
-->
<script lang="ts">
  import { Attachment } from '@hcengineering/attachment'
  import { Class, Data, Doc, DocumentQuery, Ref, Space } from '@hcengineering/core'
  import { IntlString } from '@hcengineering/platform'
  import { Icon, Label, resizeObserver, Scroller, Spinner, ButtonIcon, IconAdd } from '@hcengineering/ui'
  import view, { BuildModelKey } from '@hcengineering/view'
  import { Table } from '@hcengineering/view-resources'
  import { getClient } from '@hcengineering/presentation'
  import { FileUploadCallbackParams, uploadFiles } from '@hcengineering/uploader'
  import { createEventDispatcher } from 'svelte'

  import attachment from '../plugin'
  import { createAttachment } from '../utils'

  import AttachmentDroppable from './AttachmentDroppable.svelte'
  import IconAttachments from './icons/Attachments.svelte'
  import UploadDuo from './icons/UploadDuo.svelte'

  export let object: Doc | undefined = undefined
  export let objectId: Ref<Doc>
  export let space: Ref<Space>
  export let _class: Ref<Class<Doc>>
  export let query: DocumentQuery<Doc> = {}
  export let attachmentClass: Ref<Class<Attachment>> = attachment.class.Attachment
  export let attachmentClassOptions: Partial<Data<Attachment>> = {}
  export let extraConfig: (BuildModelKey | string)[] = []
  export let readonly = false
  export let showHeader = true
  export let label: IntlString = attachment.string.Attachments
  export let attachments: number | undefined = undefined

  let inputFile: HTMLInputElement
  let loading = 0
  let dragover = false
  let wSection: number

  const client = getClient()
  const dispatch = createEventDispatcher()

  async function onFileUploaded ({ uuid, name, file }: FileUploadCallbackParams): Promise<void> {
    await createAttachment(
      client,
      uuid,
      name,
      file,
      { objectClass: object?._class ?? _class, objectId, space },
      attachmentClass,
      attachmentClassOptions
    )
  }

  async function fileSelected (): Promise<void> {
    const list = inputFile.files
    if (list === null || list.length === 0) return

    loading++
    try {
      const options = {
        onFileUploaded,
        showProgress: {
          target: { objectId, objectClass: object?._class ?? _class }
        }
      }
      await uploadFiles(list, options)
    } finally {
      loading--
    }

    inputFile.value = ''

    dispatch('attached')
  }

  function openFile (): void {
    inputFile.click()
  }

  function updateContent (evt: CustomEvent): void {
    attachments = evt.detail.length
    dispatch('attachments', evt.detail)
  }
</script>

<div class="antiSection" use:resizeObserver={(element) => (wSection = element.clientWidth)}>
  {#if showHeader}
    <div class="antiSection-header">
      <div class="antiSection-header__icon">
        <Icon icon={IconAttachments} size={'small'} />
      </div>
      <span class="antiSection-header__title">
        <Label {label} />
      </span>
      <div class="buttons-group small-gap">
        {#if loading}
          <Spinner />
        {:else if !readonly}
          <ButtonIcon icon={IconAdd} kind={'tertiary'} size={'small'} on:click={openFile} />
        {/if}
      </div>
    </div>
  {/if}

  <input
    bind:this={inputFile}
    disabled={inputFile == null}
    multiple
    type="file"
    name="file"
    id="file"
    style="display: none"
    on:change={fileSelected}
  />
  {#if !loading && (attachments === null || attachments === 0) && !readonly}
    <AttachmentDroppable
      bind:loading
      bind:dragover
      objectClass={_class}
      {objectId}
      {space}
      {attachmentClass}
      {attachmentClassOptions}
    >
      <div class="antiSection-empty attachments flex-col" class:mt-3={showHeader} class:solid={dragover}>
        <div class="flex-center caption-color">
          <UploadDuo size={'large'} />
        </div>
        <div class="text-sm content-dark-color" style:pointer-events="none">
          <Label label={attachment.string.NoAttachments} />
        </div>
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div
          class="over-underline text-sm caption-color"
          style:pointer-events={dragover ? 'none' : 'all'}
          on:click={() => {
            inputFile.click()
          }}
        >
          <Label label={attachment.string.UploadDropFilesHere} />
        </div>
      </div>
    </AttachmentDroppable>
  {:else if wSection < 640}
    <Scroller horizontal noFade={false}>
      <Table
        _class={attachmentClass}
        config={[
          '',
          'description',
          {
            key: 'pinned',
            presenter: view.component.BooleanTruePresenter,
            label: attachment.string.Pinned,
            sortingKey: 'pinned'
          },
          ...extraConfig,
          'lastModified'
        ]}
        options={{ sort: { pinned: -1 }, showArchived: true }}
        query={{ ...query, attachedTo: objectId }}
        loadingProps={{ length: attachments ?? 0 }}
        on:content={updateContent}
        {readonly}
      />
    </Scroller>
  {:else}
    <Table
      _class={attachmentClass}
      config={[
        '',
        'description',
        {
          key: 'pinned',
          presenter: view.component.BooleanTruePresenter,
          label: attachment.string.Pinned,
          sortingKey: 'pinned'
        },
        ...extraConfig,
        'lastModified'
      ]}
      options={{ sort: { pinned: -1 }, showArchived: true }}
      query={{ ...query, attachedTo: objectId }}
      loadingProps={{ length: attachments ?? 0 }}
      on:content={updateContent}
      {readonly}
    />
  {/if}
</div>
