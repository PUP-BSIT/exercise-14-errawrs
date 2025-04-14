let nameInput = document.getElementById('comment_name');
let commentTextarea = document.getElementById('goal_comment');
let submitButton = document.getElementById('comment_button');
let form = document.querySelector('.goal-comment-form');
let commentContainer = document.querySelector('.existing-comments');
let sortSelect = document.getElementById('sort_select');

let commentTimestamps = new Map();

nameInput.addEventListener('input', validateForm);
commentTextarea.addEventListener('input', validateForm);
form.addEventListener('submit', handleSubmit);
sortSelect.addEventListener('change', sortComments);

document.addEventListener('DOMContentLoaded', () => {
    validateForm();
    
    document.querySelectorAll('.teammate-comment')
          .forEach((comment, index) => {
            
        let timestamp = Date.now();
        commentTimestamps.set(comment, timestamp);
        
        comment.dataset.timestamp = timestamp;

        let timestampElement = document.createElement('div');
        timestampElement.className = 'comment-timestamp';
        timestampElement.textContent = formatTimestamp(timestamp);
        comment.appendChild(timestampElement);
    });
});

function validateForm() {
    submitButton.disabled = !nameInput.value.trim() ||
          !commentTextarea.value.trim();
}

function handleSubmit(event) {
    event.preventDefault();
    
    let name = nameInput.value.trim();
    let comment = commentTextarea.value.trim();
    let timestamp = Date.now();
    
    const commentBox = createCommentElement(comment, name, timestamp);
    
    let isDesc = sortSelect.value === 'desc';
    let firstComment = isDesc ?
          commentContainer.querySelector('.teammate-comment') : null;

    if (firstComment) {
        commentContainer.insertBefore(commentBox, firstComment);
    } else {
        commentContainer.appendChild(commentBox);
    }
    
    form.reset();
    validateForm();
}

function createCommentElement(commentText, author, timestamp) {
    let commentBox = document.createElement('div');
    commentBox.className = 'teammate-comment';
    commentBox.dataset.timestamp = timestamp;
    
    commentBox.innerHTML = `
        <p class="comment-text">${commentText}</p>
        <span>- ${author}</span>
    `;
    
    let timestampElement = document.createElement('div');
    timestampElement.className = 'comment-timestamp';
    timestampElement.textContent = formatTimestamp(timestamp);
    commentBox.appendChild(timestampElement);
    
    commentTimestamps.set(commentBox, timestamp);
    
    return commentBox;
}

function sortComments() {
    let order = sortSelect.value === 'asc' ? 1 : -1;
    
    let comments = Array.from(document.querySelectorAll('.teammate-comment'))
          .sort((a, b) => {
              return (commentTimestamps.get(a)
                    - commentTimestamps.get(b)) * order;
    });
    
    let sortControls = commentContainer.querySelector('.sort-controls');
    let commentsHeader = commentContainer.querySelector('h3');
    commentContainer.innerHTML = '';
    
    commentContainer.appendChild(commentsHeader);
    commentContainer.appendChild(sortControls);
    
    comments.forEach(comment => commentContainer.appendChild(comment));
}

function formatTimestamp(timestamp) {
    let date = new Date(timestamp);
    return date.toLocaleString();
}

validateForm();