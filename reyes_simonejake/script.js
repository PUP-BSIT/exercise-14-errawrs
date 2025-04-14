let nameInput = document.getElementById("name");
let commentTextarea = document.getElementById("comment");
let submitButton = document.getElementById("submit_button");
let commentContainer = document.getElementById("comment_container");
let selectOrder = document.getElementById("select_order");

function validateForm() {
    submitButton.disabled =
        !nameInput.value.trim() || !commentTextarea.value.trim();
}

function handleSubmit() {
    if (submitButton.disabled) return;
    let name = nameInput.value.trim();
    let comment = commentTextarea.value.trim();
    let timestamp = new Date().toLocaleString();
   
    createCommentBox(name, comment, timestamp);
    nameInput.value = "";
    commentTextarea.value = "";
    validateForm();
}

function createCommentBox(name, comment, timestamp) {
    let commentBox = document.createElement("div");
    commentBox.className = "comment-box";

    let commentParagraph = document.createElement("p");
    commentParagraph.className = "comment-text";
    commentParagraph.textContent = comment;

    let authorParagraph = document.createElement("p");
    authorParagraph.className = "author";
    authorParagraph.textContent = name;

    let timestampParagraph = document.createElement("p");
    timestampParagraph.className = "timestamp";
    timestampParagraph.textContent = `Timestamp: ${timestamp}`;

    commentBox.append(commentParagraph, authorParagraph, timestampParagraph);
    commentContainer.append(commentBox);
}

function sortComments() {
    if (selectOrder.value === "") {
        return; 
    }

    let commentElements = Array.from(commentContainer.children);
    commentElements.sort((commentA, commentB) => {
        let timestampA = new Date(
            commentA.querySelector(".timestamp").textContent.split(": ")[1]
        );
        let timestampB = new Date(
            commentB.querySelector(".timestamp").textContent.split(": ")[1]
        );
        return selectOrder.value === "ascending"
            ? timestampA - timestampB
            : timestampB - timestampA;
    });
    commentContainer.innerHTML = ""; 
    commentElements.forEach((comment) => commentContainer.append(comment)); 
}
