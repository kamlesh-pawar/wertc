const socket = io.connect("https://wertc.vercel.app");
 
let isAlreadyCalling = false;
cfg={'iceServers': []}; con ={'optional': []};
var pc1 = new RTCPeerConnection(cfg, con);
var pc2 = new RTCPeerConnection(cfg, con);
socket.on("update-user-list", ({ users }) => {
  const activeUserContainer = document.getElementById("active-user-container");

  users.forEach((socketId) => {
    const alreadyExistingUser = document.getElementById(socketId);
    if (!alreadyExistingUser) {
      const userContainerEl = createUserItemContainer(socketId);
      activeUserContainer.appendChild(userContainerEl);
    }
  });
});

socket.on("remove-user", ({ socketId }) => {
  const elToRemove = document.getElementById(socketId);

  if (elToRemove) {
    elToRemove.remove();
  }
});

socket.on("call-made", async (data) => {
   await pc2.setRemoteDescription(
     data.offer
  );
  const answer = await pc2.createAnswer();
 await pc2.setLocalDescription(answer);
  console.log("call-made");
  socket.emit("make-answer", {
    answer,
    to: data.socket,
  });
});


socket.on("answer-made", async (data) => {
  await pc2.setRemoteDescription(
     data.answer
  );
  console.log("answer-made");
  if (!isAlreadyCalling) {
    callUser(data.socket);
    isAlreadyCalling = true;
  }
});

pc1.ontrack = function ({ streams: [stream] }) {
  const remoteVideo = document.getElementById("remote-video");
  if (remoteVideo) {
    remoteVideo.srcObject = stream;
  }
};

async function getMedia() {
  let stream = null;

  try {
    stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    const localVideo = document.getElementById("local-video");
    if (localVideo) {
      localVideo.srcObject = stream;
    }

    stream
      .getTracks()
      .forEach((track) => pc1.addTrack(track, stream));

  } catch(err) {
    alert(err);
  }
}
getMedia()

function createUserItemContainer(socketId) {
  const userContainerEl = document.createElement("div");

  const usernameEl = document.createElement("p");

  userContainerEl.setAttribute("class", "active-user");
  userContainerEl.setAttribute("id", socketId);
  usernameEl.setAttribute("class", "username");
  usernameEl.innerHTML = `Socket: ${socketId}`;

  userContainerEl.appendChild(usernameEl);

  userContainerEl.addEventListener("click", () => {
    userContainerEl.setAttribute("class", "active-user active-user--selected");
    const talkingWithInfo = document.getElementById("talking-with-info");
    talkingWithInfo.innerHTML = `Talking with: "Socket: ${socketId}"`;
    callUser(socketId);
  });
  return userContainerEl;
}


async function callUser(socketId) {
  const offer = await pc1.createOffer();
 await pc1.setLocalDescription( offer);
console.log("callingUSer");
  socket.emit("call-user", {
    offer,
    to: socketId,
  });
}

