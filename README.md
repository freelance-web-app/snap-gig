SnapGig
---------
A web app where users can post freelance gigs as open contests.
Users set the gig name, description, category, submission deadline, & payment amount.
When the gig is created, the creator becomes the gig 'owner', and receives a confirmation email.
To select a winner, the gig owner adds the winning submission ID to the winner field.

Users are able to submit files for each gig as long as they didn't create it.
Submissions are compiled in an S3 bucket and populated into the submissions field of the gig.
When the winning submission is selected, the submission creator is notified.

Execution
---------
1. Create a new user

curl -X POST --data '{"username":"your-username", "password":"your-password", "email":"your-email@email.com", "occupation":"your-occupation"}' localhost:3000/public/user

2. Login and Extract Token

curl -X POST -u username:password localhost:3000/login/login

3. To Show All Gigs

curl -X GET -H 'Authorization: token INSERT YOUR_TOKEN_HERE' localhost:3000/api/gigs

4. To Post a New Gig

curl -X POST -H 'Authorization: token YOUR_TOKEN' --data '{"name":"gig-name", "category":"gig-category", "description":"gig-description", "deadline": "xx-xx-xxxx", "payment_range":value}' localhost:3000/api/gigs

5. To Post a Submission

curl -X POST -H 'Authorization: token YOUR_TOKEN' --data '{"name":"submission-name", "body":"submission-description", "path":"file-path-to-submission-file "}' localhost:3000/api/gigs/:GIG_ID/submissions
