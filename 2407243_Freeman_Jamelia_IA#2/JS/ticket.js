// Retrieve the registration details stored in sessionStorage
let savedTicket = sessionStorage.getItem("codingConfTicket");
let ticketCard = document.querySelector("#ticket-card");
let message = document.querySelector("#ticket-message");

if (savedTicket == null) {
    message.hidden = false;
}
else {
    try {
        let attendee = JSON.parse(savedTicket);

        if (!attendee.ticketNumber) {
            attendee.ticketNumber = String(Math.floor(10000 + Math.random() * 90000));
        }

        // Display the registration details on the ticket
        document.querySelector("#ticket-name").textContent = attendee.fullName;
        document.querySelector("#ticket-name-heading").textContent = attendee.fullName;
        document.querySelector("#ticket-github").textContent = attendee.gitHub;
        document.querySelector("#ticket-confirmation-email").textContent = attendee.email;
        document.querySelector("#ticket-number").textContent = attendee.ticketNumber;
        document.querySelector("#ticket-avatar").src = attendee.avatar;

        ticketCard.hidden = false;
        document.querySelector("#ticket-confirmation").hidden = false;

        // Save the ticket number if it was missing from the stored details
        sessionStorage.setItem("codingConfTicket", JSON.stringify(attendee));
    }
    catch (error) {
        console.error("Could not load ticket details:", error);
        message.textContent = "Your ticket details couldn't be read. Please register again.";
        message.hidden = false;
    }
}
