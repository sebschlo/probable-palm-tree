
AFRAME.registerComponent('change-color-on-hover', {
  schema: {
    color: {type: 'color', default: 'red'}
  },
  init: function () {
    // Do something when component first attached.
  },
  update: function () {
    // Do something when component's data is updated.
    
  },
  tick: function (time, timeDelta) {
    // Do something on every scene tick or frame.
  },
  remove: function () {
    // Do something the component or its entity is detached.
  },
  pause: function () {},
  play: function () {}
});