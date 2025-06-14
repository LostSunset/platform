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
import { Level } from '@tiptap/extension-heading'
import Table from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import TextAlign from '@tiptap/extension-text-align'
import TextStyle from '@tiptap/extension-text-style'

import { CodeExtension, codeOptions } from '../marks/code'
import { BackgroundColor, TextColor } from '../marks/colors'
import { InlineCommentMark } from '../marks/inlineComment'
import { NoteBaseExtension } from '../marks/noteBase'
import { NodeUuid } from '../marks/nodeUuid'

import { CodeBlockExtension, codeBlockOptions } from '../nodes'
import { CommentNode } from '../nodes/comment'
import { FileNode, FileOptions } from '../nodes/file'
import { ImageNode, ImageOptions } from '../nodes/image'
import { MarkdownNode } from '../nodes/markdown'
import { MermaidExtension, mermaidOptions } from '../nodes/mermaid'
import { ReferenceNode } from '../nodes/reference'
import { EmojiNode } from '../nodes/emoji'
import { TodoItemNode, TodoListNode } from '../nodes/todo'

import { DefaultKit, DefaultKitOptions } from './default-kit'
import { EmbedNode } from '../nodes/embed'

const headingLevels: Level[] = [1, 2, 3, 4, 5, 6]

const tableExtensions = [
  Table.configure({
    resizable: false,
    HTMLAttributes: {
      class: 'proseTable'
    }
  }),
  TableRow.configure({}),
  TableHeader.configure({}),
  TableCell.configure({})
]

const taskListExtensions = [
  TaskList,
  TaskItem.configure({
    nested: true,
    HTMLAttributes: {
      class: 'flex flex-grow gap-1 checkbox_style'
    }
  })
]

export interface ServerKitOptions extends DefaultKitOptions {
  file: Partial<FileOptions> | false
  image: Partial<ImageOptions> | false
}

export const ServerKit = Extension.create<ServerKitOptions>({
  name: 'serverKit',

  addExtensions () {
    const fileExtensions = this.options.file !== false ? [FileNode.configure(this.options.file)] : []

    const imageExtensions = this.options.image !== false ? [ImageNode.configure(this.options.image)] : []

    return [
      DefaultKit.configure({
        ...this.options,
        codeBlock: false,
        code: false,
        heading: {
          levels: headingLevels
        }
      }),
      InlineCommentMark.configure({}),
      CodeBlockExtension.configure(codeBlockOptions),
      CodeExtension.configure(codeOptions),
      MermaidExtension.configure(mermaidOptions),
      ...tableExtensions,
      ...taskListExtensions,
      ...fileExtensions,
      ...imageExtensions,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right'],
        defaultAlignment: null
      }),
      TodoItemNode,
      TodoListNode,
      ReferenceNode,
      EmojiNode,
      CommentNode,
      MarkdownNode,
      NodeUuid,
      NoteBaseExtension,
      TextStyle.configure({}),
      TextColor.configure({}),
      BackgroundColor.configure({ types: ['tableCell'] }),
      EmbedNode.configure({})
    ]
  }
})
