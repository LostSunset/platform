<script lang="ts">
  //
  // © 2025 Hardcore Engineering, Inc. All Rights Reserved.
  // Licensed under the Eclipse Public License v2.0 (SPDX: EPL-2.0).
  //
  export let size: 'small' | 'medium' | 'large' | 'x-large'
  const fill: string = 'currentColor'
</script>

<svg class="svg-{size}" viewBox="0 0 24 24" {fill} xmlns="http://www.w3.org/2000/svg">
  <path
    d="M20.7,6.9l-3.6-3.6c-1.4-1.4-3.7-1.4-5.1,0L9.3,6C8.6,6.6,8.2,7.6,8.2,8.5c0,0.9,0.3,1.7,0.8,2.3l-1.6,1.6c-0.1,0.1-0.2,0.3-0.2,0.5v1.2H6c-0.4,0-0.8,0.3-0.8,0.8v1.2H4c-0.2,0-0.4,0.1-0.5,0.2l-0.6,0.6c-0.4,0.5-0.6,1.1-0.6,1.8l0,1.2l0,0.2c0.1,0.9,0.9,1.5,1.7,1.5l1.2,0l0.2,0c0.6-0.1,1.2-0.3,1.7-0.8l6-6c1.4,1.2,3.6,1.1,4.9-0.2l2.6-2.6C22.1,10.6,22.1,8.3,20.7,6.9z M19.6,11L17,13.6c-0.8,0.8-2.2,0.8-3,0l-0.3-0.3c-0.3-0.3-0.8-0.3-1.1,0l-6.6,6.6c-0.2,0.2-0.5,0.3-0.7,0.4l-1.3,0c-0.1,0-0.2-0.1-0.2-0.2l0-1.2c0-0.3,0.1-0.6,0.3-0.8l0.3-0.3H6c0.4,0,0.8-0.3,0.8-0.8v-1.2H8c0.4,0,0.8-0.3,0.8-0.8v-1.7l1.9-1.9c0.1-0.1,0.2-0.3,0.2-0.5c0-0.2-0.1-0.4-0.2-0.5L10.4,10c-0.8-0.8-0.8-2.2,0-3L13,4.4c0.8-0.8,2.2-0.8,3,0L19.6,8C20.5,8.8,20.5,10.2,19.6,11z"
  />
  <path d="M15,7.8L15,7.8c-0.7,0-1.3,0.6-1.3,1.2s0.6,1.2,1.3,1.2s1.2-0.6,1.2-1.2S15.7,7.8,15,7.8z" />
</svg>
