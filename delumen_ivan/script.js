let input = document.querySelector(".name");
let textarea = document.querySelector("textarea");
let button = document.querySelector(".submit-button");
let commentSection = document.querySelector(".teammate-comment");
let sortOption = document.querySelector(".sort-option");

button.disabled = true;
button.classList.add("disabled");

input.addEventListener("input", checkValue);
textarea.addEventListener("input", checkValue);
sortOption.addEventListener("change", sortComments);

function checkValue() {
    const hasValidInput = input.value.trim() && textarea.value.trim();
    
    button.disabled = !hasValidInput;
    button.classList.toggle("disabled", !hasValidInput);
    button.classList.toggle("enable", hasValidInput);
}

function addComment() {
    const now = new Date();
    const commentHTML = `
        <div class="comment-item" data-timestamp="${now.toISOString()}">
            <p>${textarea.value.trim()}</p>
            <strong>${input.value.trim()}</strong>
            <span class="comment-timestamp">${now.toLocaleString()}</span>
        </div>`;

    commentSection.insertAdjacentHTML("beforeend", commentHTML);
    input.value = "";
    textarea.value = "";
    checkValue();

    if (sortOption.value === "ascending" || sortOption.value === "descending") 
        {
            sortComments();
    }
}

function addTimestampsToExistingComments() {
    const comments = commentSection.querySelectorAll(
          ".comment-item:not(:has(.comment-timestamp))"
    );
    const now = new Date();

    comments.forEach((comment, index) => {
        const timestamp = new Date(now);
        timestamp.setMinutes(timestamp.getMinutes() - index * 5);

        const timeStamp = document.createElement("span");
        timeStamp.classList.add("comment-timestamp");
        timeStamp.textContent = timestamp.toLocaleString();
        comment.appendChild(timeStamp);
        comment.dataset.timestamp = timestamp.toISOString();
    });
}

function sortComments() {
    const comments = Array.from(
        commentSection.querySelectorAll(".comment-item")
    );
    const order = sortOption.value;

    if (!order) return;

    comments.sort((a, b) => {
        const timeA = new Date(a.dataset.timestamp);
        const timeB = new Date(b.dataset.timestamp);
        if (order === "ascending") {
            return timeA - timeB;
        }else if (order === "descending") {
            return timeB - timeA;
        }
            return;
    });

    const fragment = document.createDocumentFragment();
    comments.forEach((comment) => fragment.appendChild(comment));
    commentSection.appendChild(fragment);
}

addTimestampsToExistingComments();