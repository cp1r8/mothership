<!--
  The SVG filter that makes black-and-white photos look like the cathode-green
  text: white becomes the text colour, black (and anything already transparent)
  becomes transparent, and two
  blurred copies give the same inner and outer glow as .cathode-green's
  text-shadow. Rendered once (by PersonnelRoster); used by PersonnelPhoto as
  `filter: … url(#phosphor-glow)`.
-->
<template>
  <svg width="0" height="0" class="absolute" aria-hidden="true">
    <filter id="phosphor-glow" color-interpolation-filters="sRGB">
      <!-- Brightness becomes opacity, in the text colour (phosphor-50). -->
      <feColorMatrix
        type="matrix"
        values="0 0 0 0 0.941  0 0 0 0 1  0 0 0 0 0.973  1 0 0 0 0"
        result="lit"
      />
      <feComposite in="lit" in2="SourceAlpha" operator="in" result="core" />

      <!-- Inner glow (phosphor-200). -->
      <feGaussianBlur in="core" stdDeviation="1.5" result="innerBlur" />
      <feFlood flood-color="#80ffc0" />
      <feComposite in2="innerBlur" operator="in" result="inner" />

      <!-- Outer glow (phosphor-500). -->
      <feGaussianBlur in="core" stdDeviation="4" result="outerBlur" />
      <feFlood flood-color="#00ff66" />
      <feComposite in2="outerBlur" operator="in" result="outer" />

      <feMerge>
        <feMergeNode in="outer" />
        <feMergeNode in="inner" />
        <feMergeNode in="core" />
      </feMerge>
    </filter>
  </svg>
</template>
