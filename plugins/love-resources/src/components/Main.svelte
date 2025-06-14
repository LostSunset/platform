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
  import { deviceOptionsStore as deviceInfo } from '@hcengineering/ui'
  import { onDestroy, onMount } from 'svelte'
  import presentation from '@hcengineering/presentation'
  import { RoomType } from '@hcengineering/love'

  import Hall from './Hall.svelte'
  import { getMetadata } from '@hcengineering/platform'
  import love from '../plugin'
  import { tryConnect, isConnected, isCurrentInstanceConnected, screenSharing } from '../utils'
  import { infos, invites, myInfo, myRequests, waitForOfficeLoaded, currentRoom } from '../stores'

  const localNav: boolean = $deviceInfo.navigator.visible
  const savedNav = localStorage.getItem('love-visibleNav')
  if (savedNav !== undefined) $deviceInfo.navigator.visible = savedNav === 'true'
  $: localStorage.setItem('love-visibleNav', JSON.stringify($deviceInfo.navigator.visible))

  onDestroy(() => {
    $deviceInfo.navigator.visible = localNav
  })

  onMount(async () => {
    const wsURL = getMetadata(love.metadata.WebSocketURL)

    if (wsURL === undefined) {
      return
    }

    await waitForOfficeLoaded()
    const room = $currentRoom

    if (room === undefined) return

    if (
      !$isConnected &&
      !$isCurrentInstanceConnected &&
      (room.type === RoomType.Video || $screenSharing) &&
      $myInfo?.sessionId &&
      $myInfo.sessionId === getMetadata(presentation.metadata.SessionId)
    ) {
      const info = $infos.filter((p) => p.room === room._id)
      await tryConnect($myInfo, room, info, $myRequests, $invites)
    }
  })
</script>

<div class="hulyPanels-container">
  <Hall />
</div>
