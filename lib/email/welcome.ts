/**
 * Send welcome email with login credentials
 * Uses Resend API
 */

interface WelcomeEmailParams {
  email: string
  password: string | null
  productName: string
  apps: string[]
}

export async function sendWelcomeEmail({
  email,
  password,
  productName,
  apps,
}: WelcomeEmailParams): Promise<boolean> {
  const resendApiKey = process.env.RESEND_API_KEY

  if (!resendApiKey) {
    console.error('RESEND_API_KEY not configured')
    return false
  }

  const appsList = apps
    .map((app) => {
      const names: Record<string, string> = {
        'meal-planner': 'Meal Planner',
        'sleep-protocol': 'Sleep Protocol',
        'supplement-timing': 'Supplement Timing',
        'exercise-guide': 'Exercise Guide',
        'lab-testing': 'Lab Testing',
      }
      return names[app] || app
    })
    .join(', ')

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${password ? 'Добре дошли в Testograph' : 'Нови приложения в Testograph'}</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0;">${password ? 'Добре дошли в Testograph! 🎉' : 'Нови приложения добавени! 🚀'}</h1>
  </div>

  <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
    <p style="font-size: 16px; margin-bottom: 20px;">
      Благодарим ви за покупката на <strong>${productName}</strong>!
    </p>

    <p style="font-size: 16px; margin-bottom: 20px;">
      ${password ? 'Вашият акаунт е създаден и имате' : 'Добавихме нови приложения към вашия акаунт. Сега имате'} достъп до следните приложения:
    </p>

    <ul style="background: white; padding: 20px 40px; border-radius: 8px; margin: 20px 0;">
      ${apps.map((app) => `<li style="margin: 10px 0;">${app}</li>`).join('')}
    </ul>

    ${password ? `
    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
      <p style="margin: 0 0 10px 0; font-weight: bold;">Вашите данни за вход:</p>
      <p style="margin: 5px 0;"><strong>Имейл:</strong> ${email}</p>
      <p style="margin: 5px 0;"><strong>Парола:</strong> ${password}</p>
    </div>

    <p style="font-size: 14px; color: #666; margin: 20px 0;">
      ⚠️ Моля запазете тази информация на сигурно място. Препоръчваме да промените паролата си след първото влизане.
    </p>
    ` : `
    <p style="font-size: 14px; color: #666; margin: 20px 0; background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #28a745;">
      ℹ️ Използвайте вашата съществуваща парола за да влезете в акаунта си.
    </p>
    `}

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
  </div>
</body>
</html>
`

  const textContent = `
${password ? 'Добре дошли в Testograph!' : 'Нови приложения добавени!'}

Благодарим ви за покупката на ${productName}!

${password ? 'Вашият акаунт е създаден и имате' : 'Добавихме нови приложения към вашия акаунт. Сега имате'} достъп до следните приложения:
${appsList}

${password ? `Вашите данни за вход:
Имейл: ${email}
Парола: ${password}

⚠️ Моля запазете тази информация на сигурно място.` : `ℹ️ Използвайте вашата съществуваща парола за да влезете в акаунта си.`}

Влезте в акаунта си тук: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard

Ако имате въпроси, свържете се с нас на support@testograph.eu
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
        subject: password
          ? 'Добре дошли в Testograph - Данни за Вход'
          : '🚀 Нови приложения добавени към вашия акаунт',
        html: htmlContent,
        text: textContent,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Failed to send email:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error sending email:', error)
    return false
  }
}
