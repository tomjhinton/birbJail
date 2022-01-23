# birbJail


For @sableRaph's weekly Creative Coding Challenge. The Challenge topic was 'Creative Code Jail'.

- Little blender model, big surprise.
- I have learnt 2 things from genuary
  1. I have no respect for the generative aspect / that bit's hard so I ignore it.
  2. How to stick P5 into three.js

Here's how you load the p5 canvas into three.js, just in case anybody else ever finds a reason to do this.


```
  p5C  = document.getElementById('defaultCanvas0')
  p5CTex = new THREE.CanvasTexture(p5C)
  screenMaterial.uniforms.uTexture2 ={
    value: p5CTex
  }
```

Basically took the suggestions from the chat channel.

- [In cell one we have Rishi](https://twitter.com/DenisovichPy/status/1459962562754199555)
- In cell 2 we have some noise mirrored around the origin.
- In cell 3 we have some mondrian, which i assume could be the unofficial topic of the week.
- In cell 4 I didn't really know what to put but someone mentioned drop-shadow and borders.

- Also my lunatic liberal politics meant I was actually quite uncomfortable incarcerating ppl so I made the title a jailbreak button.

- Then I thought I'd add in a tweakpane but basically without reason so other than the first one it's quite pointless.
- Kind of like those buttons you sometimes get at streetcrossings that dont do anything.
-Keeps you occupied but really why are you pressing it?


I did actually want to make it so you could stick new people in the cells but that actually turned out to be more work than I was willing to do / I ran out of time. Need to figure out how to do proper error handling one week. You know creative error handling, bit of fun coding as a way to relax. Now I remember why I didnt do it. 
