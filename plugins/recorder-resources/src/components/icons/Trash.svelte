<!--
// Copyright © 2025 Hardcore Engineering Inc.
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
  export let size: 'tiny' | 'x-small' | 'small' | 'medium' | 'large' | 'full'
  export let fill: string = 'currentColor'
</script>

<svg width="32" height="32" viewBox="0 0 32 32" class="svg-{size}" {fill} xmlns="http://www.w3.org/2000/svg">
  <path
    d="M12 23C12 23.5523 12.4477 24 13 24C13.5523 24 14 23.5523 14 23V13C14 12.4477 13.5523 12 13 12C12.4477 12 12 12.4477 12 13V23Z"
  />
  <path
    d="M20 23C20 23.5523 19.5523 24 19 24C18.4477 24 18 23.5523 18 23V13C18 12.4477 18.4477 12 19 12C19.5523 12 20 12.4477 20 13V23Z"
  />
  <path
    clip-rule="evenodd"
    d="M15 2C13.3431 2 12 3.34315 12 5V6H5C4.44772 6 4 6.44772 4 7C4 7.55228 4.44772 8 5 8H6V26C6 28.2091 7.79086 30 10 30H22C24.2091 30 26 28.2091 26 26V8H27C27.5523 8 28 7.55228 28 7C28 6.44772 27.5523 6 27 6H20V5C20 3.34315 18.6569 2 17 2H15ZM18 6V5C18 4.44772 17.5523 4 17 4H15C14.4477 4 14 4.44772 14 5V6H18ZM8 26V8H24V26C24 27.1046 23.1046 28 22 28H10C8.89543 28 8 27.1046 8 26Z"
  />
</svg>
