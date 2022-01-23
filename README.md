# birbJail

# birbGlitchenagerie

For @sableRaph's weekly Creative Coding Challenge. The Challenge topic was 'Creative Code Jail'.

- Little blender model.
- 



- [In cell one we have Rishi](https://twitter.com/DenisovichPy/status/1459962562754199555)
- In cell 2 we have some noise mirrored around the origin.
- In cell 3 we have some mondrian, which i assume could be the unofficial topic of the week.
- In cell 4 I didn't really know what to put but someone mentioned drop-shadow and borders.

Here's how you load the p5 canvas into three.js, just in case anybody else evev finds a reason to do this.

```
p5C  = document.getElementById('defaultCanvas0')
p5CTex = new THREE.CanvasTexture(p5C)
screenMaterial.uniforms.uTexture2 ={
  value: p5CTex
}
```
