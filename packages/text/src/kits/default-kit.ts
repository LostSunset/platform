//
// Copyright © 2023 Hardcore Engineering Inc.
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

import { Extension } from '@tiptap/core'
import BulletList from '@tiptap/extension-bullet-list'
import type { CodeOptions } from '@tiptap/extension-code'
import type { CodeBlockOptions } from '@tiptap/extension-code-block'
import { Level } from '@tiptap/extension-heading'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import ListItem from '@tiptap/extension-list-item'
import OrderedList from '@tiptap/extension-ordered-list'
import Typography from '@tiptap/extension-typography'
import Underline from '@tiptap/extension-underline'
import StarterKit from '@tiptap/starter-kit'
import { codeOptions } from '../marks/code'
import { codeBlockOptions } from '../nodes'

export interface DefaultKitOptions {
  codeBlock?: Partial<CodeBlockOptions> | false
  code?: Partial<CodeOptions> | false
  heading?: {
    levels?: Level[]
  }
  history?: false
}

export const DefaultKit = Extension.create<DefaultKitOptions>({
  name: 'defaultKit',

  addExtensions () {
    return [
      StarterKit.configure({
        blockquote: {
          HTMLAttributes: {
            class: 'proseBlockQuote'
          }
        },
        code: this.options.code ?? codeOptions,
        codeBlock: this.options.codeBlock ?? codeBlockOptions,
        heading: this.options.heading,
        history: this.options.history,
        bulletList: false,
        orderedList: false,
        listItem: false
      }),
      ListItem.extend({ group: 'listItems' }),
      BulletList.extend({ content: 'listItems+' }),
      OrderedList.extend({ content: 'listItems+' }),
      Underline,
      Highlight.configure({
        multicolor: false
      }),
      Typography.configure({}),
      Link.extend({ inclusive: false }).configure({
        openOnClick: false,
        HTMLAttributes: { class: 'cursor-pointer', rel: 'noopener noreferrer', target: '_blank' }
      })
    ]
  }
})
