const inputName = document.getElementById("comment_name");
const inputComment = document.getElementById("comment_box");
const commentBtn = document.getElementById("comment_btn");
const commentSection = document.querySelector(".comment-section");
const sortSelection = document.getElementById("sort_selection");

disableCommentButton();

const comments = Array.from(document.querySelectorAll(".comment-box"))
	  .map((comment) => initializeComments(comment));

function initializeComments(comment) {
	const stampText = comment.querySelector(".stamp").textContent;
	const [datePart, timePart] = stampText.split(", ");
	const [day, month, year] = datePart.split("/");
	const [hours, minutes, seconds] = timePart.split(":");

	return {
		name: comment.querySelector(".commenter").textContent,
		text: comment.querySelector(".comments").textContent,
		time: new Date(year, month - 1, day, hours, minutes, seconds),
		element: comment,
	};
}

function checkRequirements() {
	const isNameValid = inputName.value.trim();
	const isCommentValid = inputComment.value.trim();
	commentBtn.disabled = !(isNameValid && isCommentValid);
	commentBtn.classList.toggle("enabled", isNameValid && isCommentValid);
	commentBtn.classList.toggle("disabled", !(isNameValid && isCommentValid));
}

function addComment() {
	const now = new Date();
	const commentObject = {
		name: inputName.value.trim(),
		text: inputComment.value.trim(),
		time: now,
		element: createCommentElement(now),
	};

	comments.push(commentObject);
	commentSection.appendChild(commentObject.element);
	sortComment();
	clearInputFields();
	disableCommentButton();
}

function createCommentElement(timestamp) {
	const commentElement = document.createElement("div");
	commentElement.className = "comment-box";

	commentElement.innerHTML = `
        <span class="commenter">${inputName.value.trim()}</span>
        <p class="comments">${inputComment.value.trim()}</p>
        <div class="stamp">${timestamp.toLocaleString()}</div>`;

	return commentElement;
}

function clearInputFields() {
	inputName.value = "";
	inputComment.value = "";
}

function disableCommentButton() {
	commentBtn.disabled = true;
	commentBtn.classList.remove("enabled");
	commentBtn.classList.add("disabled");
}

function sortComment() {
	const sortOrder = sortSelection.value;
	if (!sortOrder) return;

	comments.sort((a, b) =>
		sortOrder === "ascending" ? a.time - b.time : b.time - a.time
	);

	commentSection.innerHTML = "";
	comments.forEach((comment) => commentSection.appendChild(comment.element));
}