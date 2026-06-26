import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    let body = {};
    try {
      body = await req.json();
    } catch (e) {}

    const reminderType = body.reminder_type || "win_the_day";

    // Get all onboarded players with a phone number
    const users = await base44.asServiceRole.entities.User.list("-created_date", 500);
    const players = users.filter(u =>
      u.role === "player" &&
      u.onboarded === true &&
      u.phone
    );

    if (players.length === 0) {
      return Response.json({ message: "No players with phone numbers found", sent: 0 });
    }

    let recipients = players;
    let messageBody = "";

    if (reminderType === "win_the_day") {
      // Only remind players who haven't submitted today
      const today = new Date().toISOString().split('T')[0];
      const reports = await base44.asServiceRole.entities.FocusReport.filter({ report_date: today });
      const submittedIds = new Set(reports.filter(r => r.submitted).map(r => r.created_by_id));
      recipients = players.filter(p => !submittedIds.has(p.id));
      messageBody = "Good morning! Don't forget to fill out your Win The Day report — start your day with intention and purpose.";
    } else if (reminderType === "mental_gym") {
      messageBody = "Time to train your mind! Check out today's Mental Gym content and keep building your mental game.";
    } else if (reminderType === "goals") {
      messageBody = "Weekly goal check-in! Take a few minutes to review and set your goals for the week ahead.";
    } else {
      return Response.json({ error: "Invalid reminder_type" }, { status: 400 });
    }

    if (recipients.length === 0) {
      return Response.json({ reminder_type: reminderType, sent: 0, message: "No recipients needed a reminder" });
    }

    // Send SMS via Twilio
    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const fromNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

    if (!accountSid || !authToken || !fromNumber) {
      return Response.json({ error: "Twilio credentials not configured" }, { status: 500 });
    }

    const auth = btoa(`${accountSid}:${authToken}`);
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

    let sent = 0;
    let failed = 0;

    for (const player of recipients) {
      try {
        const response = await fetch(twilioUrl, {
          method: "POST",
          headers: {
            "Authorization": `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            From: fromNumber,
            To: player.phone,
            Body: messageBody,
          }).toString(),
        });

        if (response.ok) {
          sent++;
        } else {
          const errorData = await response.text();
          console.error(`Failed to send SMS to ${player.phone}:`, errorData);
          failed++;
        }
      } catch (err) {
        console.error(`Error sending SMS to ${player.phone}:`, err.message);
        failed++;
      }
    }

    return Response.json({
      reminder_type: reminderType,
      sent,
      failed,
      total_recipients: recipients.length
    });
  } catch (error) {
    console.error("SMS reminder error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});