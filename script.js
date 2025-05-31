const video = document.getElementById("video");
const statusText = document.getElementById("status");

async function loadModels() {
  try {
    await faceapi.nets.tinyFaceDetector.loadFromUri("models");
    await faceapi.nets.ageGenderNet.loadFromUri("models");
    statusText.innerText = "✅ Models loaded. Starting camera...";
    startVideo();
  } catch (err) {
    statusText.innerText = "❌ Failed to load models.";
    console.error(err);
  }
}

function startVideo() {
  navigator.mediaDevices.getUserMedia({ video: {} })
    .then(stream => {
      video.srcObject = stream;
      statusText.innerText = "🔍 Detecting face...";
    })
    .catch(err => {
      statusText.innerText = "❌ Kamera gagal diakses!";
      console.error(err);
    });
}

video.addEventListener("play", () => {
  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);
  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);

  setInterval(async () => {
    const detections = await faceapi
      .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withAgeAndGender();

    const resized = faceapi.resizeResults(detections, displaySize);
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

    resized.forEach(result => {
      const { age, gender, genderProbability } = result;
      const box = result.detection.box;
      const label = `${gender} (${(genderProbability * 100).toFixed(1)}%) - Age: ${age.toFixed(1)}`;
      const drawBox = new faceapi.draw.DrawBox(box, { label });
      drawBox.draw(canvas);
    });
  }, 500);
});

loadModels();
