'use strict';

var nodeMailer = require('nodemailer');

var mailer = {};

mailer.gig = (userEmail, fileName, userName, deadline, gig, cb) => {
  var transporter = nodeMailer.createTransport('smtps://snapgignotification@gmail.com:snapsnap@smtp.gmail.com');
  var mailOptions = {
    from: '"snapgig" <snapgignotification@gmail.com>',
    to: userEmail,
    subject: 'New Gig, ' + fileName + ' has been created',
    text: userName + ', your gig, ' + fileName + ', has been successfully submitted. The deadline for submissions is, ' + deadline
  }
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      return (error)
    }
    return gig
  })
}

mailer.submission = (gigEmail, submissionName, submissionUser, gigName, gigOwner, cb) => {
  var transporter = nodeMailer.createTransport('smtps://snapgignotification@gmail.com:snapsnap@smtp.gmail.com');
  var mailOptions = {
    from: '"snapgig" <snapgignotification@gmail.com>',
    to: gigEmail,
    subject: 'A new submission has been posted by ' + submissionUser,
    text: gigOwner + ', a submission named ' + submissionName + ', has been posted to your gig, ' + gigName
  }
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      return (error)
    }
      return info
  })
}

mailer.winner = (winnerEmail, winnerName, cb) => {
  var transporter = nodeMailer.createTransport('smtps://snapgignotification@gmail.com:snapsnap@smtp.gmail.com');
  var mailOptions = {
    from: '"snapgig" <snapgignotification@gmail.com>',
    to: winnerEmail,
    subject: 'Your submission has been picked as the winner!',
    text: 'Congratulations, ' + winnerName + '! Your submission was picked as the winner for one of your recent gig entries. Your gig owner should be getting in touch with you soon, let us know if you have any questions in the meantime!'
  };
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      return (error)
    }
    return info;
  });
};
module.exports = mailer;
