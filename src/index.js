
import paper from 'paper'
import './style.css'
import * as dat from 'dat.gui';


// CANVAS
const gui = new dat.GUI();
window.paper = paper;
// const values
const app = {
	SAMPLE_COUNT: 8,
	MAX_RAY_LENGTH: 1000,
	TRAJECTORY: 1,
	LIGHT_POS: new paper.Point(0,0)
}
gui.add(app, 'TRAJECTORY', 0, 1).onChange((value)=>{
	update()
});
gui.add(app, 'SAMPLE_COUNT', 1, 100).onChange((value)=>{
	update()
});
gui.add(app, 'MAX_RAY_LENGTH', 1, 1000).onChange((value)=>{
	update()
});

// setup paper on canvas
const canvas = document.createElement('canvas');
canvas.style.backgroundColor = 'hsla(0, 0%, 0%, 1)';
document.body.appendChild(canvas);
paper.setup(canvas);

// create scene
let sceneLayer = new paper.Layer({name: "scene"})

for(let i=0;i<3;i++){
	var square = new paper.Path.Rectangle({
		point: [700/3*i+70, 150],
		size: [700/8, 100],
		strokeColor: 'grey',
		selected: true
	});
};

var circle = new paper.Path.Circle({
	center: new paper.Point(300, 600),
	radius: 50,
	strokeColor: 'grey',
	selected: true
});

// create layers
let sightLayer = new paper.Layer({name: "sight"});
let raysLayer = new paper.Layer({name: "rays"});
let debugLayer = new paper.Layer({name: 'debug'});

raysLayer.visible=false

let intersectionLayer = new paper.Layer({name: 'intersections'});
window.sceneLayer = sceneLayer;

// light follow mouse
var tool = new paper.Tool();

var mouse = new paper.Point(0,0)
tool.onMouseDrag = (event)=>{
	app.LIGHT_POS = event.point;
} 


function animate(){
	update()
	requestAnimationFrame(animate)
}

animate()

function walk(callback){
	// DFS

}

function update() {
	// Create rays
	raysLayer.removeChildren()

	// Shoot rays in all direction
	let angles = []
	angles = angles.concat( Array.from({length: app.SAMPLE_COUNT}, (v, i)=>-Math.PI+Math.PI*2/app.SAMPLE_COUNT*i) );

	// Shoot rays to corners
	const scenePaths = sceneLayer.getItems({type: 'path'});

	for(let item of scenePaths){
		for(let seg of item.segments){
			let angle = Math.atan2(
				seg.point.y - app.LIGHT_POS.y,
				seg.point.x - app.LIGHT_POS.x
			);
			angles.push(angle-0.001,angle,angle+0.001);
		}
	}

	for(let angle of angles){
		var dir = new paper.Point(Math.cos(angle)*app.MAX_RAY_LENGTH, Math.sin(angle)*app.MAX_RAY_LENGTH);

		new paper.Path.Line({
			from: app.LIGHT_POS,
			to: app.LIGHT_POS.add(dir),
			strokeColor: 'orange',
			closed: false,
			parent: raysLayer,
			data:{
				angle
			}
		});
	}

	// Calculate all rays/scene intersections
	for(let ray of raysLayer.children){
		// find all intersection with scene
		let intersections = scenePaths.reduce( (prev, next)=>{
			return prev.concat(ray.getIntersections(next));
		}, []);
		if(intersections.length==0) continue;

		// select closest intersection
		let closest = intersections.reduce( (a, b)=>{
			return a.point.getDistance(ray.segments[0].point)
			< b.point.getDistance(ray.segments[0].point) ? a : b;
		} );

		// terminate ray at closest intersection
		ray.segments[1].point = closest.point;
	}

	sightLayer.removeChildren();
	let polygon = new paper.Path({
		fillColor: 'hsla(0, 100%, 100%, 1)', 
		closed: false,
		parent: sightLayer
	});

	let intersections = raysLayer.children.map( (line)=>{
		return {point: line.segments[1].point, angle: line.data.angle};
	});

	intersections = intersections.sort( (a, b)=>{
		return a.angle - b.angle;
	} )

	window.intersections = intersections;

	raysLayer.children.sort( (a, b)=>a.data.angle-b.data.angle );

	// polygon.add(mouse.point);
	for(let i=0; i< app.TRAJECTORY*raysLayer.children.length; i++){
		let line = raysLayer.children[i];
		polygon.add(line.segments[1].point);
	}

	debugLayer.removeChildren();
	// // Display intersection angles
	// for(let i=0; i< intersections.length; i++){
	// 	let intersection = intersections[i];
	// 	new paper.PointText({
	// 		point: intersection.point,
	// 		content: (intersection.angle / Math.PI/2 *360).toFixed(0),
	// 		parent: debugLayer,
	// 		fillColor: 'lightgreen',
	// 		fontSize: 24
	// 	});
	// }

	// Display intersections
	// intersectionLayer.removeChildren()
	// for(let intersection of intersections){
	// 	let point = intersection.point;
	// 	let c = new paper.Path.Circle({
	// 		center: point,
	// 		radius: 2,
	// 		parent: intersectionLayer,
	// 		fillColor: 'red'
	// 	});
	// }
}


let importElement = document.createElement('input');
importElement.type="file";
document.body.appendChild(importElement);
importElement.addEventListener('change', (event)=>{
	console.log('CHANGE', event);
	let file = event.srcElement.files[0];
	paper.project.importSVG(file, (item, svg)=>{
		console.log('loaded', item);
		sceneLayer.removeChildren();
		item.setParent(sceneLayer);
		sceneLayer.selected = true;
		// item.parent = sceneLayer;
	});
});