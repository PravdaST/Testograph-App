/**
 * Send password changed notification email
 * Uses Resend API
 */

interface PasswordChangedEmailParams {
  email: string
  timestamp: string
}

export async function sendPasswordChangedEmail({
  email,
  timestamp,
}: PasswordChangedEmailParams): Promise<boolean> {
  const resendApiKey = process.env.RESEND_API_KEY

  if (!resendApiKey) {
    console.error('RESEND_API_KEY not configured')
    return false
  }

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Парола променена</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">🔒 Парола променена</h1>
  </div>

  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px; margin-bottom: 20px;">
      Здравейте,
    </p>

    <p style="font-size: 16px; margin-bottom: 20px;">
      Паролата на вашия Testograph акаунт беше променена успешно.
    </p>

    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
      <p style="margin: 0 0 10px 0; font-weight: bold; font-size: 14px; color: #666;">Детайли за промяната:</p>
      <p style="margin: 5px 0;"><strong>Имейл:</strong> ${email}</p>
      <p style="margin: 5px 0;"><strong>Дата и час:</strong> ${timestamp}</p>
    </div>

    <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 4px; margin: 20px 0;">
      <p style="margin: 0; font-size: 14px; color: #856404;">
        <strong>⚠️ Не сте направили тази промяна?</strong><br>
        Ако не сте вие, моля свържете се с нас незабавно на <a href="mailto:support@testograph.eu" style="color: #667eea; text-decoration: none;">support@testograph.eu</a>
      </p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
         style="display: inline-block; background: #667eea; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
        Влез в Акаунта
      </a>
    </div>

    <p style="font-size: 14px; color: #666; margin-top: 30px; text-align: center;">
      Ако имате въпроси, свържете се с нас на support@testograph.eu
    </p>
  </div>

  <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
    <p>© ${new Date().getFullYear()} Testograph. Всички права запазени.</p>
    <p style="margin-top: 10px;">
      Този email е изпратен автоматично за сигурност на вашия акаунт.
    </p>
  </div>
</body>
</html>
`

  const textContent = `
Парола променена

Здравейте,

Паролата на вашия Testograph акаунт беше променена успешно.

Детайли за промяната:
- Имейл: ${email}
- Дата и час: ${timestamp}

⚠️ НЕ СТЕ НАПРАВИЛИ ТАЗИ ПРОМЯНА?
Ако не сте вие, моля свържете се с нас незабавно на support@testograph.eu

Влезте в акаунта си тук: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard

Ако имате въпроси, свържете се с нас на support@testograph.eu

© ${new Date().getFullYear()} Testograph. Всички права запазени.
Този email е изпратен автоматично за сигурност на вашия акаунт.
`

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Testograph <noreply@shop.testograph.eu>',
        to: email,
        subject: '🔒 Паролата на вашия акаунт беше променена',
        html: htmlContent,
        text: textContent,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Failed to send password changed email:', error)
      return false
    }

    console.log(`✅ Password changed email sent to ${email}`)
    return true
  } catch (error) {
    console.error('Error sending password changed email:', error)
    return false
  }
}
