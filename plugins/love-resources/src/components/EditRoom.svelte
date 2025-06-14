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
  import { EditBox, ModernButton } from '@hcengineering/ui'
  import { Room, isOffice, type ParticipantInfo } from '@hcengineering/love'
  import { createEventDispatcher, onMount } from 'svelte'
  import { IntlString } from '@hcengineering/platform'

  import love from '../plugin'
  import { getRoomName, tryConnect, isConnected } from '../utils'
  import { infos, invites, myInfo, myRequests, selectedRoomPlace, myOffice, currentRoom } from '../stores'

  export let object: Room

  const dispatch = createEventDispatcher()

  let roomName: string
  $: void getRoomName(object).then((name) => {
    roomName = name
  })

  let connecting = false

  onMount(() => {
    dispatch('open', { ignoreKeys: ['name'] })
  })

  let tryConnecting = false

  async function connect (): Promise<void> {
    tryConnecting = true
    const place = $selectedRoomPlace
    await tryConnect(
      $myInfo,
      object,
      $infos,
      $myRequests,
      $invites,
      place?._id === object._id ? { x: place.x, y: place.y } : undefined
    )
    tryConnecting = false
    selectedRoomPlace.set(undefined)
  }

  $: connecting = tryConnecting || ($currentRoom?._id === object._id && !$isConnected)

  let connectLabel: IntlString = $infos.some(({ room }) => room === object._id)
    ? love.string.JoinMeeting
    : love.string.StartMeeting

  $: if ($infos.some(({ room }) => room === object._id) && !connecting) {
    connectLabel = love.string.JoinMeeting
  } else if (!connecting) {
    connectLabel = love.string.StartMeeting
  }

  function showConnectionButton (
    object: Room,
    connecting: boolean,
    isConnected: boolean,
    info: ParticipantInfo[],
    myOffice?: Room,
    currentRoom?: Room
  ): boolean {
    if (isOffice(object)) {
      // Do not show connect button in own office
      if (object._id === myOffice?._id) return false
      // Do not show connect for empty office
      if (object.person === null) return false

      const owner = object.person
      const ownerInfo = info.find((p) => p.person === owner)
      // Do not show connect if owner is not in the office
      if (ownerInfo?.room !== object._id) return false
    }

    // Show during connecting with spinner
    if (connecting) return true
    // Do not show connect button if we are already connected to the room
    if (isConnected && currentRoom?._id === object._id) return false

    return true
  }
</script>

<div class="flex-row-stretch">
  <div class="row flex-grow">
    <div class="name">
      <EditBox disabled={true} placeholder={love.string.Room} bind:value={roomName} focusIndex={1} />
    </div>
    {#if showConnectionButton(object, connecting, $isConnected, $infos, $myOffice, $currentRoom)}
      <ModernButton label={connectLabel} size="large" kind={'primary'} on:click={connect} loading={connecting} />
    {/if}
  </div>
</div>

<style lang="scss">
  .name {
    font-weight: 500;
    font-size: 1.25rem;
    color: var(--theme-caption-color);
    width: 100%;
  }

  .row {
    display: flex;
    align-items: center;
    gap: var(--spacing-1);
    justify-content: space-between;
  }
</style>
