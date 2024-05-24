 let d;
// d = Math.random() * 3;
// console.log(d);

var qdrant=false;

document.addEventListener("DOMContentLoaded", function () {
  var popup = document.getElementById("popup");
  var closeBtn = document.getElementsByClassName("close")[0];

  // Check if the popup has already been shown in this session
  if (!sessionStorage.getItem("popupDisplayed")) {
    // Show the popup
    popup.style.display = "block";

    // Set sessionStorage item to indicate the popup has been displayed
    sessionStorage.setItem("popupDisplayed", "true");
  }

  // Close the popup when the user clicks on the close button
  closeBtn.onclick = function () {
    popup.style.display = "none";
  };

  // Close the popup when the user clicks anywhere outside of the popup
  window.onclick = function (event) {
    if (event.target == popup) {
      popup.style.display = "block";
    }
  };

  const form = document.getElementById("uploadForm");
  const fileInput = document.getElementById("fileInput");
  const fileListContainer = document.getElementById("fileList");

  var overlay = document.getElementById("overlay");
  var elements = document.querySelectorAll(
    "body > *:not(#overlay):not(#lottieContainer)"
  );

  // Event listener for file input change
  fileInput.addEventListener("change", () => {
    fileListContainer.innerHTML = ""; // Clear the previous list

    if (fileInput.files.length === 0) {
      fileListContainer.innerHTML = "<p>No files selected!</p>";
    } else {
      const list = document.createElement("ul");
      Array.from(fileInput.files).forEach((file) => {
        const listItem = document.createElement("li");
        listItem.textContent = file.name; // Display the file name
        list.appendChild(listItem);
      });
      fileListContainer.appendChild(list);
    }
  });

  var isFirstClick = true;

  function flow(event) {
    if(qdrant===false){
    //let d;
    d = Math.random() * 3;
    console.log(d);
    }
    qdrant=true;

    event.preventDefault();
    if (fileInput.files.length === 0) {
      alert("No files uploaded!");
    } else {
      lottieAnimation.style.display = "block";
      overlay.style.display = "block";
      elements.forEach(function (element) {
        element.classList.add("blur");
      });

      let formData = new FormData(form);
      formData.append("qdrantCollection", `${d}`);
      fetch(
        "https://flowise-production-a718.up.railway.app/api/v1/vector/upsert/ec8a0802-b5a6-4768-8ce4-c535b7cb0b5e",
        {
          method: "POST",
          body: formData,
        }
      )
        .then((response) => response.json())
        .then((data) => {
          if (data.numAdded) {
            lottieAnimation.style.display = "none";
            overlay.style.display = "none";
            elements.forEach(function (element) {
              element.classList.remove("blur");
            });

            const button = document.getElementById("button");
            const sub = document.getElementById("sub");
            const steps = document.getElementById("steps");
            const resumeImg=document.getElementById("visual2");
            const jdImg=document.getElementById("visual");


            if (isFirstClick) {
              // Change the button text and reset file input
              button.value = "Upload Resumes";
              sub.innerHTML = "Lets upload some resumes now.";
              steps.innerHTML = "Step 2: Upload your resumes in docx or pdf.";
              fileInput.value = ""; // Reset the file input
              fileListContainer.innerHTML = ""; // Clear the displayed file list
              jdImg.style.display="none";
              resumeImg.style.display="block";


              isFirstClick = false;
            } else {
              alert("Files uploaded successfully!");
              window.location.href = `/chat.html?id=${d}`;
            }
          } else {
            alert("Failed to upload: " + data.message);
          }
        })
        .catch((error) => {
          alert("Error uploading files: See console for details.");
          console.error(error);
        });
    }
  }

  form.addEventListener("submit", flow);
});

// Add the event listener to the copy button
document
  .getElementById("copyButton")
  .addEventListener("click", copyChatHistory);

// // Retrieve the data from localStorage
// let rawData = localStorage.getItem('ec8a0802-b5a6-4768-8ce4-c535b7cb0b5e_EXTERNAL');

// // Parse the JSON string into a JavaScript object
// let chatData = JSON.parse(rawData);

// Function to display and format chat messages
// function displayChatMessages() {
//   chatData.chatHistory.forEach((chat) => {
//     const prefix = chat.type === "userMessage" ? "User" : "AI";
//     console.log(`${prefix}: ${chat.message}`);
//   });
// }
// Function to copy chat messages to clipboard
function copyChatHistory() {
  // Retrieve the data from localStorage
  let rawData = localStorage.getItem(
    "ec8a0802-b5a6-4768-8ce4-c535b7cb0b5e_EXTERNAL"
  );

  // Parse the JSON string into a JavaScript object
  let chatData = JSON.parse(rawData);
  // Get all chat messages as a single string
  let allMessages = chatData.chatHistory
    .map((chat) => {
      const prefix = chat.type === "userMessage" ? "User" : "AI";
      return `${prefix}: ${chat.message}`;
    })
    .join("\n");

  // Use the Clipboard API to copy text
  navigator.clipboard
    .writeText(allMessages)
    .then(() => {
      alert("Chat history copied to clipboard!");
    })
    .catch((err) => {
      console.error("Failed to copy chat history: ", err);
    });
}

// Display chat messages in the console
//displayChatMessages();

document
  .getElementById("exportButton")
  .addEventListener("click", exportChatHistory);

// Retrieve the data from localStorage
//let rawData = localStorage.getItem('ec8a0802-b5a6-4768-8ce4-c535b7cb0b5e_EXTERNAL');

// Parse the JSON string into a JavaScript object
//let chatData = JSON.parse(rawData);

// Function to export chat messages to a Word document
function exportChatHistory() {
  // Retrieve the data from localStorage
  let rawData = localStorage.getItem(
    "ec8a0802-b5a6-4768-8ce4-c535b7cb0b5e_EXTERNAL"
  );

  //   // Parse the JSON string into a JavaScript object
  let chatData = JSON.parse(rawData);
  fetch("/exportChat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ chatData: chatData.chatHistory }), // Pass only the chat history
  })
    .then((response) => response.blob())
    .then((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = "chatHistory.docx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    })
    .catch((error) => console.error("Error exporting chat history:", error));
}
