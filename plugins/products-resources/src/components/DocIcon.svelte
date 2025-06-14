<!--
// Copyright © 2024 Hardcore Engineering Inc.
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
  import { Asset } from '@hcengineering/platform'
  import { IconWithEmoji } from '@hcengineering/presentation'
  import { AnySvelteComponent, Icon, IconFolder, IconSize, getPlatformColorDef, themeStore } from '@hcengineering/ui'
  import view, { IconProps } from '@hcengineering/view'

  import { ComponentType } from 'svelte'

  export let value: IconProps
  export let size: IconSize
  export let iconWithEmoji: AnySvelteComponent | Asset | ComponentType | undefined = view.ids.IconWithEmoji
  export let defaultIcon: AnySvelteComponent | Asset | ComponentType = IconFolder
</script>

<Icon
  {size}
  icon={value.icon === iconWithEmoji && iconWithEmoji !== undefined ? IconWithEmoji : value.icon ?? defaultIcon}
  iconProps={value.icon === iconWithEmoji && iconWithEmoji !== undefined
    ? { icon: value.color }
    : {
        fill:
          value.color !== undefined && typeof value.color !== 'string'
            ? getPlatformColorDef(value.color, $themeStore.dark).icon
            : 'currentColor'
      }}
/>
