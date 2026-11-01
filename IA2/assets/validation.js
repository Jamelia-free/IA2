let form = document.getElementById("registration-form");

if (form) {
    let fileInput = document.getElementById("file");
    let dropzone = document.getElementById("avatar-dropzone");
    let uploadField = document.querySelector(".upload-field");
    let avatarPreview = document.getElementById("avatar-preview");
    let avatarPrompt = document.getElementById("avatar-prompt");
    let avatarActions = document.getElementById("avatar-actions");
    let avatarHint = document.getElementById("avatar-hint");

    let previewUrl = null;
    let avatarFile = null;
    let maxFileSize = 500 * 1024;

    // Display an upload message
    function showAvatarMessage(message) {
        if (message == "") {
            avatarHint.textContent = "Upload your photo (JPG or PNG, max size: 500KB).";
            uploadField.classList.remove("has-error");
            fileInput.setAttribute("aria-invalid", "false");
        }
        else {
            avatarHint.textContent = message;
            uploadField.classList.add("has-error");
            fileInput.setAttribute("aria-invalid", "true");
        }
    }

    // Check the uploaded image and display its preview
    function checkImage(image) {
        if (!image) {
            showAvatarMessage("Please upload an avatar image.");
            return false;
        }

        if (image.type != "image/png" && image.type != "image/jpeg") {
            avatarFile = null;
            fileInput.value = "";
            showAvatarMessage("Please upload a JPG or PNG image.");
            return false;
        }
        else if (image.size > maxFileSize) {
            avatarFile = null;
            fileInput.value = "";
            showAvatarMessage("File too large. Please upload a photo under 500KB.");
            return false;
        }

        avatarFile = image;
        showAvatarMessage("");

        if (previewUrl != null) {
            URL.revokeObjectURL(previewUrl);
        }

        previewUrl = URL.createObjectURL(image);
        avatarPreview.src = previewUrl;
        avatarPreview.hidden = false;
        avatarPrompt.hidden = true;
        dropzone.querySelector(".avatar-upload-icon").hidden = true;
        avatarActions.hidden = false;
        return true;
    }

    // Clear earlier form errors
    function clearErrors() {
        document.getElementById("name-error").textContent = "";
        document.getElementById("email-error").textContent = "";
        document.getElementById("github-error").textContent = "";
        document.getElementById("name-error").hidden = true;
        document.getElementById("email-error").hidden = true;
        document.getElementById("github-error").hidden = true;
    }

    // Check the entered registration details
    function validate() {
        clearErrors();

        let fullName = document.getElementById("full-name").value.trim();
        let email = document.getElementById("email").value.trim();
        let gitHub = document.getElementById("gitHub").value.trim();
        let valid = true;

        if (fullName.length == 0) {
            document.getElementById("name-error").textContent = "Please enter your full name.";
            document.getElementById("name-error").hidden = false;
            valid = false;
        }

        if (email.length == 0) {
            document.getElementById("email-error").textContent = "Please enter a valid email address.";
            document.getElementById("email-error").hidden = false;
            valid = false;
        }
        else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
            document.getElementById("email-error").textContent = "Please enter a valid email address.";
            document.getElementById("email-error").hidden = false;
            valid = false;
        }

        if (gitHub.length == 0) {
            document.getElementById("github-error").textContent = "GitHub username must start with @.";
            document.getElementById("github-error").hidden = false;
            valid = false;
        }
        else if (gitHub.charAt(0) != "@" || gitHub.length == 1) {
            document.getElementById("github-error").textContent = "GitHub username must start with @.";
            document.getElementById("github-error").hidden = false;
            valid = false;
        }

        if (fullName.length == 0) {
            document.getElementById("full-name").setAttribute("aria-invalid", "true");
        }
        else {
            document.getElementById("full-name").setAttribute("aria-invalid", "false");
        }

        if (email.length == 0 || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
            document.getElementById("email").setAttribute("aria-invalid", "true");
        }
        else {
            document.getElementById("email").setAttribute("aria-invalid", "false");
        }

        if (gitHub.length == 0 || gitHub.charAt(0) != "@" || gitHub.length == 1) {
            document.getElementById("gitHub").setAttribute("aria-invalid", "true");
        }
        else {
            document.getElementById("gitHub").setAttribute("aria-invalid", "false");
        }

        return valid;
    }

    // Show an error after a field has been filled in incorrectly
    form.addEventListener("input", function (event) {
        if (event.target.id == "full-name" ||
            event.target.id == "email" ||
            event.target.id == "gitHub") {
            validate();
        }
    });

    fileInput.addEventListener("change", function () {
        checkImage(fileInput.files[0]);
    });

    document.getElementById("change-avatar").addEventListener("click", function () {
        fileInput.click();
    });

    document.getElementById("remove-avatar").addEventListener("click", function () {
        avatarFile = null;
        fileInput.value = "";

        if (previewUrl != null) {
            URL.revokeObjectURL(previewUrl);
        }

        previewUrl = null;
        avatarPreview.removeAttribute("src");
        avatarPreview.hidden = true;
        avatarPrompt.hidden = false;
        dropzone.querySelector(".avatar-upload-icon").hidden = false;
        avatarActions.hidden = true;
        showAvatarMessage("");
    });

    dropzone.addEventListener("dragover", function (event) {
        event.preventDefault();
        dropzone.classList.add("avatar-drop-active");
    });

    dropzone.addEventListener("dragleave", function () {
        dropzone.classList.remove("avatar-drop-active");
    });

    dropzone.addEventListener("drop", function (event) {
        event.preventDefault();
        dropzone.classList.remove("avatar-drop-active");
        checkImage(event.dataTransfer.files[0]);
    });

    // Validate the form and save the ticket details
    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        let valid = validate();
        let imageValid = checkImage(avatarFile);

        if (valid == false || imageValid == false) {
            if (imageValid == false) {
                fileInput.focus();
            }
            else if (document.getElementById("full-name").getAttribute("aria-invalid") == "true") {
                document.getElementById("full-name").focus();
            }
            else if (document.getElementById("email").getAttribute("aria-invalid") == "true") {
                document.getElementById("email").focus();
            }
            else {
                document.getElementById("gitHub").focus();
            }

            return;
        }

        let image;

        try {
            image = await createImageBitmap(avatarFile);

            let canvas = document.createElement("canvas");
            let size = 160;
            let scale = size / Math.min(image.width, image.height);
            let cropSize = size / scale;
            let context = canvas.getContext("2d");
            canvas.width = size;
            canvas.height = size;

            context.drawImage(
                image,
                (image.width - cropSize) / 2,
                (image.height - cropSize) / 2,
                cropSize,
                cropSize,
                0,
                0,
                size,
                size
            );

            let attendee = {
                fullName: document.getElementById("full-name").value.trim(),
                email: document.getElementById("email").value.trim(),
                gitHub: document.getElementById("gitHub").value.trim(),
                ticketNumber: String(Math.floor(10000 + Math.random() * 90000)),
                avatar: canvas.toDataURL("image/jpeg", 0.8)
            };

            sessionStorage.setItem("codingConfTicket", JSON.stringify(attendee));
            window.location.href = form.action;
        }
        catch (error) {
            console.error("Could not save registration details:", error);
            showAvatarMessage("Could not process the avatar. Please try another image.");
        }
        finally {
            if (image) {
                image.close();
            }
        }
    });
}
