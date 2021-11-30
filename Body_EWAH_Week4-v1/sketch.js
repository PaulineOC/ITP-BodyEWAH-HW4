
let p5lm;
let partnerPose = null;
let partnerEyeDist = 0;

let myPose = null;
let myEyeDist = 0;

const confidenceThreshold = 0.2;
const armWidth = 15;
const handSize = 60;

const cHeight = 480*1.25;
const cWidth = 640*1.25;

let hasWon = false;

function setup() {
  createCanvas(cWidth, cHeight);

  const myVid = createCapture(VIDEO);
  myVid.size(width,height);
  myVid.hide();

  // create an instance of p5 live media 
  // that opens a data channel, and creates the meeting room "body-ewah-45"
  p5lm = new p5LiveMedia(this, "DATA", null, "body-ewah-455");
  // set callback for when data is received
  p5lm.on('data', gotPartnerPose);

  // create an instance with posenet 
  const posenet = ml5.poseNet(myVid);
  // set callback for when pose is received
  posenet.on('pose', gotMyPose);
}

function gotMyPose(poses) {
  if (poses.length === 0) return;
  myPose = poses[0].pose;
  // the sendind data must be turned into a string before sending
  p5lm.send(JSON.stringify(myPose));
}

function gotPartnerPose(data, id) {
  // put the data in a global variable 
  // data arrives as a string and must be parsed into JSON to be useable 
  partnerPose = JSON.parse(data);
}


/*
  Draw Skeleton - taken from my Dancing Queen HW
*/

function calculateEyeDist(currPose, isMe){
  let eyeR = currPose.rightEye;
  let eyeL = currPose.leftEye;
  
  if(isMe){
    myEyeDist = dist(eyeR.x, eyeR.y, eyeL.x, eyeL.y);
  }
  else{
    partnerEyeDist = dist(eyeR.x, eyeR.y, eyeL.x, eyeL.y);
  }
}

function drawBodyPoints(pose, isMe){
    calculateEyeDist(pose, isMe);
    drawHead(pose, isMe);
    drawTorso(pose, isMe);
    drawLeftArm(pose, isMe)
    drawRightArm(pose, isMe);
}

function drawHead(currPose, isMe){
   //Draw Head = Nose (but blown up)
    let noseX = map(currPose.nose.x, 0, width, 0, width/2);
    let faceWidth = currPose.leftEar.y;
    let faceHeight = currPose.leftEye.y+30;
    ellipse(noseX, currPose.nose.y,faceWidth, faceHeight );
}

function drawTorso(currPose, isMe){
  const hasJoints = (
    currPose.leftShoulder.confidence > confidenceThreshold &&
    currPose.rightShoulder.confidence >  confidenceThreshold &&
    currPose.leftHip.confidence >  confidenceThreshold &&
    currPose.rightHip.confidence > confidenceThreshold
  );
  
  if(!hasJoints){
     return;
  }
  let hipWidth = currPose.rightShoulder.x- currPose.leftShoulder.x;
  let hipHeight = currPose.leftHip.y- currPose.leftShoulder.y;
  let fillColor = isMe ? 'red': 'blue' ;
  fill(fillColor);
  let leftShoulderX =  map(currPose.leftShoulder.x, 0, width, 0, width/2);
  rect(leftShoulderX, currPose.leftShoulder.y, hipWidth, hipHeight );
}

function drawLeftArm(currPose, isMe){
  
  const hasJoints = (
    currPose.leftShoulder.confidence > confidenceThreshold &&
    currPose.leftElbow.confidence >  confidenceThreshold &&
    currPose.leftWrist.confidence >  confidenceThreshold
  );
  if(!hasJoints){
    return;
  }
  const { leftShoulder, leftElbow, leftWrist } = currPose;
  
  let leftShoulderX = map(leftShoulder.x, 0, width, 0, width/2);
  let leftElbowX = map(leftElbow.x, 0, width, 0, width/2);
  let leftWristX = map(leftWrist.x, 0, width, 0, width/2);
  
  let strokeColor = isMe ? 'red': 'blue' ;
  stroke(strokeColor);
  strokeWeight(armWidth);
  
  line(leftShoulderX, leftShoulder.y, leftElbowX, leftElbow.y)
  line(leftElbowX, leftElbow.y, leftWristX, leftWrist.y);
  
  let eyeDist = isMe ? myEyeDist: partnerEyeDist;
  let handY = leftElbow.y < leftWrist.y ? 
      leftWrist.y + (eyeDist*1.25)
      : leftWrist.y - (eyeDist*1.25);
  
  let handColor = isMe? 'red': 'blue';
  fill(handColor);
  stroke('yellow');
  strokeWeight(2);
  ellipse(leftWristX, handY, handSize,handSize);
}

function drawRightArm(currPose, isMe){
  const hasJoints = (
    currPose.rightShoulder.confidence > confidenceThreshold &&
    currPose.rightElbow.confidence >  confidenceThreshold &&
    currPose.rightWrist.confidence >  confidenceThreshold
  );
  if(!hasJoints){
    return;
  }
  const { rightShoulder, rightElbow, rightWrist } = currPose;
  
  let rightShoulderX = map(rightShoulder.x, 0, width, 0, width/2 );
  let rightElbowX = map(rightElbow.x, 0, width, 0, width/2 );
  let rightWristX = map(rightWrist.x, 0, width, 0, width/2);
  
  let strokeColor = isMe ? 'red': 'blue' ;
  stroke(strokeColor);
  strokeWeight(armWidth);
  line(rightShoulderX, rightShoulder.y, rightElbowX, rightElbow.y)
  line(rightElbowX, rightElbow.y, rightWristX, rightWrist.y);
  let eyeDist = isMe ? myEyeDist: partnerEyeDist;
  let handY = rightElbow.y < rightWrist.y ? 
      rightWrist.y + (eyeDist*1.25)
      : rightWrist.y - (eyeDist*1.25);
 let handColor = isMe? 'red': 'blue';
  fill(handColor);
  stroke('green');
  strokeWeight(2);
  ellipse(rightWristX, rightWrist.y, handSize,handSize);
}


function drawSelf(){
  
  if(!myPose){
    return;
  }
  fill('red');
  drawBodyPoints(myPose, true);
}

function drawPartner(){
   if(!partnerPose){
    return;
  }
  fill('blue');
  drawBodyPoints(partnerPose, false);

  
}

function hasHighFived(){
  if(!myPose || !partnerPose){
     return;
   }
  
  let myLeftHandX = myPose.leftWrist.x;
  let myLeftHandY = myPose.leftElbow.y < myPose.leftWrist.y ? 
      myPose.leftWrist.y + (myEyeDist*1.25)
      : myPose.leftWrist.y - (myEyeDist*1.25);
  
  //Need to mirror X
  let partnerRightHandX = partnerPose.rightWrist.x;
  let partnerRightHandY = partnerPose.rightElbow.y < partnerPose.rightWrist.y ? 
      partnerPose.rightWrist.y + (myEyeDist*1.25)
      : partnerPose.rightWrist.y - (myEyeDist*1.25);
  
  if(
      myLeftHandX > partnerRightHandX + handSize ||
      myLeftHandX + handSize > partnerRightHandX ||
      myLeftHandY > partnerRightHandY + handSize ||
      myLeftHandY + handSize > partnerRightHandY
      ){
        console.log('my left hand and partner right hand');
        return true;
      }
  
  let myRightHandX = myPose.rightWrist.x;
  let myRightHandY = myPose.rightElbow.y < myPose.rightWrist.y ? 
      myPose.rightWrist.y + (myEyeDist*1.25)
      : myPose.leftWrist.y - (myEyeDist*1.25);
  
  //Need to mirror X
  let partnerLeftHandX = partnerPose.leftWrist.x;
  let partnerLeftHandY = partnerPose.leftElbow.y < partnerPose.leftWrist.y ? 
      partnerPose.leftWrist.y + (myEyeDist*1.25)
      : partnerPose.leftWrist.y - (myEyeDist*1.25);
  
   if(
      myLeftHandX > partnerRightHandX + handSize ||
      myLeftHandX + handSize > partnerRightHandX ||
      myLeftHandY > partnerRightHandY + handSize ||
      myLeftHandY + handSize > partnerRightHandY
      ){
    console.log('my right hand and partner left hand');
     return true;
      }
  
  
  return true;
}


function draw() {
  background(0);
  push()
  translate(width, 0)
  scale(-1, 1);
  drawSelf();
  pop();
  drawPartner();
  //First time winning
  if(hasHighFived() && !hasWon){
    hasWon = true;
  }
  // if(hasWon){
  //    console.log('has won');
  // }
}