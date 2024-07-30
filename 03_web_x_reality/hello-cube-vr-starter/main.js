const sceneElement = document.querySelector('a-scene');
console.log(sceneElement.querySelector('#box'));
var elements = sceneElement.querySelectorAll('*');
for (let i = 0; i < elements.length; i++) {
  console.log(elements[i]);
}
const cube = document.createElement('a-box');
// set the cube attributes
cube.setAttribute('color', 'tomato')
cube.setAttribute('height', '2')
cube.setAttribute('depth', '2')
cube.setAttribute('width', '2')
cube.setAttribute("position", "3 1 0");
// append the cube to the scene
sceneElement.appendChild(cube);

let count = 0;
const moveRight = () => {
  count += 0.01
  requestAnimationFrame(render);
  cube.setAttribute('position', `${Math.sin(count * 2) + 1} 3 0`)
} 
moveRight()