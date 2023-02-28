<script>
  import SoundItem from "./lib/SoundItem.svelte"
</script>

<div class="w-full min-h-screen bg-[#111] text-white px-12 py-8">
  <div class="text-4xl font-bold">My Sounds</div>
  <div class="py-6" />
  <div
    class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
  >
    <SoundItem />
    <SoundItem />
    <SoundItem />
  </div>
</div>

<div class="fixed bottom-8 right-12">
  <button
    class="rounded-full bg-blue-700 p-4 transition duration-300 hover:bg-blue-600"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="2"
      stroke="white"
      class="w-6 h-6"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M12 4.5v15m7.5-7.5h-15"
      />
    </svg>
  </button>
</div>
