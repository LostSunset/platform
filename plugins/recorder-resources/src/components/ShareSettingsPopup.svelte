<script lang="ts">
  import { Label, Toggle } from '@hcengineering/ui'
  import plugin from '../plugin'
  import { useScreenShareSound } from '../stores'
</script>

<div class="antiPopup p-4 grid">
  <Label label={plugin.string.ShareWithAudio} />
  <Toggle
    on={$useScreenShareSound}
    on:change={(e) => {
      $useScreenShareSound = e.detail
    }}
  />
</div>

<style lang="scss">
  .grid {
    display: grid;
    grid-template-columns: 1fr auto;
    row-gap: 1rem;
    column-gap: 1rem;
    align-items: center;
  }
</style>
