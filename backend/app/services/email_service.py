import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Optional
from app.core.config import settings

class EmailService:
    def __init__(self):
        self.gmail_email = settings.GMAIL_EMAIL
        self.gmail_password = settings.GMAIL_APP_PASSWORD
        self.smtp_server = "smtp.gmail.com"
        self.smtp_port = 587
    
    async def send_email(
        self, 
        to_emails: List[str], 
        subject: str, 
        html_content: str,
        text_content: Optional[str] = None
    ):
        """Send email using Gmail SMTP"""
        if not self.gmail_email or not self.gmail_password:
            print("Gmail credentials not configured, skipping email send")
            return
        
        try:
            # Create message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = self.gmail_email
            msg['To'] = ', '.join(to_emails)
            
            # Add text and HTML parts
            if text_content:
                text_part = MIMEText(text_content, 'plain')
                msg.attach(text_part)
            
            html_part = MIMEText(html_content, 'html')
            msg.attach(html_part)
            
            # Send email
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls()
                server.login(self.gmail_email, self.gmail_password)
                server.send_message(msg)
            
            print(f"Email sent successfully to {', '.join(to_emails)}")
            
        except Exception as e:
            print(f"Failed to send email: {e}")
    
    async def send_wedding_invitation(self, guest_email: str, guest_name: str, wedding_details: str):
        """Send wedding invitation email"""
        subject = "You're Invited! 💒"
        
        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #E30016, #DDB66A); padding: 40px; text-align: center; color: white;">
                <h1 style="margin: 0; font-size: 28px;">You're Invited!</h1>
                <p style="margin: 10px 0 0 0; font-size: 16px;">Join us for a special celebration</p>
            </div>
            
            <div style="padding: 40px; background: white;">
                <p style="font-size: 18px; color: #333;">Dear {guest_name},</p>
                
                <p style="font-size: 16px; line-height: 1.6; color: #555;">
                    We are delighted to invite you to {wedding_details}. Your presence would make our special day even more memorable.
                </p>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0; font-size: 14px; color: #666;">
                        Please confirm your attendance by replying to this email or contacting us directly.
                    </p>
                </div>
                
                <p style="font-size: 16px; color: #333;">
                    With love and excitement,<br>
                    <strong>Forever & Co.</strong>
                </p>
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
                <p>This invitation was sent via Forever & Co. - Your One-Stop Wedding Wonderland</p>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
        Dear {guest_name},
        
        You're invited to {wedding_details}!
        
        Your presence would make our special day even more memorable.
        
        Please confirm your attendance by replying to this email.
        
        With love and excitement,
        Forever & Co.
        """
        
        await self.send_email([guest_email], subject, html_content, text_content)