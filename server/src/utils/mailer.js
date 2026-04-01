import nodemailer from 'nodemailer';

// Configure the transporter. 
const createTransporter = () => {
    // Uses Google SMTP by default. Users must provide App Passwords in .env
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.SMTP_USER || 'placeholder@gmail.com',
            pass: process.env.SMTP_PASSWORD || 'password123'
        }
    });
};

export const sendTaskAssignmentEmail = async (assigneeEmail, taskTitle, projectName, priority) => {
    try {
        if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
            console.warn("SMTP credentials missing in .env. Skipping email dispatch.");
            return;
        }
        
        // Ensure it's roughly an email shape
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(assigneeEmail);
        if (!isEmail) {
            console.log(`Assignee identifier '${assigneeEmail}' is not a valid email address. Skipping dispatch.`);
            return;
        }

        const transporter = createTransporter();

        const priorityColors = {
            CRITICAL: { bg: '#fee2e2', text: '#dc2626' },
            HIGH: { bg: '#ffedd5', text: '#ea580c' },
            MEDIUM: { bg: '#fef3c7', text: '#d97706' },
            LOW: { bg: '#f1f5f9', text: '#475569' }
        };
        const colors = priorityColors[priority] || priorityColors.LOW;

        const mailOptions = {
            from: `"CommitStream Board" <${process.env.SMTP_USER}>`,
            to: assigneeEmail,
            subject: `[CommitStream] New Assigned Task: ${taskTitle}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                    <div style="background-color: #3b82f6; color: white; padding: 20px; text-align: center;">
                        <h2 style="margin: 0;">CommitStream</h2>
                    </div>
                    <div style="padding: 20px; color: #334155;">
                        <p>Hello,</p>
                        <p>You have been assigned a new task in the project workspace <strong>${projectName}</strong>.</p>
                        
                        <div style="background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
                            <h3 style="margin: 0 0 10px 0; color: #0f172a;">${taskTitle}</h3>
                            <p style="margin: 0; font-size: 14px;">
                                <strong>Priority:</strong> 
                                <span style="background-color: ${colors.bg}; color: ${colors.text}; padding: 3px 10px; border-radius: 12px; font-weight: bold; font-size: 12px; margin-left: 5px;">
                                    ${priority}
                                </span>
                            </p>
                        </div>
                        
                        <p>Please launch your CommitStream dashboard to review the task specifications and begin tracking your branch progress.</p>
                    </div>
                </div>
            `
        };

        const result = await transporter.sendMail(mailOptions);
        console.log("Assignment email sent globally:", result.messageId);
    } catch (error) {
        console.error("Failed to route external task assignment email:", error);
    }
};

export const sendProjectInvitationEmail = async (toEmail, projectName, inviterName, inviteLink) => {
    try {
        if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
            console.warn("SMTP credentials missing in .env. Skipping email dispatch.");
            return;
        }

        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(toEmail);
        if (!isEmail) {
            console.log(`Identifier '${toEmail}' is not a valid email address. Skipping dispatch.`);
            return;
        }

        const transporter = createTransporter();

        const mailOptions = {
            from: `"CommitStream Board" <${process.env.SMTP_USER}>`,
            to: toEmail,
            subject: `[CommitStream] Invitation to join ${projectName}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                    <div style="background-color: #3b82f6; color: white; padding: 20px; text-align: center;">
                        <h2 style="margin: 0;">CommitStream</h2>
                    </div>
                    <div style="padding: 20px; color: #334155;">
                        <p>Hello,</p>
                        <p><strong>${inviterName}</strong> has invited you to join the project workspace <strong>${projectName}</strong> on CommitStream.</p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${inviteLink}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                                Accept Invitation
                            </a>
                        </div>
                        
                        <p style="font-size: 14px; color: #64748b; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                            If the button doesn't work, you can copy and paste this link into your browser:<br>
                            <a href="${inviteLink}" style="color: #3b82f6; word-break: break-all;">${inviteLink}</a>
                        </p>
                    </div>
                </div>
            `
        };

        const result = await transporter.sendMail(mailOptions);
        console.log("Project invitation email sent:", result.messageId);
    } catch (error) {
        console.error("Failed to send project invitation email:", error);
    }
};
