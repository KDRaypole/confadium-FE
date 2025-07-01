export interface EmailTemplate {
  id: string;
  name: string;
  category: "welcome" | "follow_up" | "nurturing" | "promotion" | "notification" | "reminder";
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: string[];
  description: string;
  previewText: string;
}

export const emailTemplates: EmailTemplate[] = [
  {
    id: "welcome_new_lead",
    name: "Welcome New Lead",
    category: "welcome",
    subject: "Welcome to {{company_name}}, {{contact_name}}!",
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to {{company_name}}!</h1>
        </div>
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Hi {{contact_name}},</p>
          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            Thank you for your interest in our services! We're excited to help you achieve your goals.
          </p>
          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            Our team will be in touch with you shortly to discuss how we can best serve your needs.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{calendar_link}}" style="background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Schedule a Call</a>
          </div>
          <p style="font-size: 14px; color: #666;">
            Best regards,<br>
            {{sender_name}}<br>
            {{company_name}}
          </p>
        </div>
      </div>
    `,
    textContent: `
Hi {{contact_name}},

Welcome to {{company_name}}!

Thank you for your interest in our services! We're excited to help you achieve your goals.

Our team will be in touch with you shortly to discuss how we can best serve your needs.

Schedule a call: {{calendar_link}}

Best regards,
{{sender_name}}
{{company_name}}
    `,
    variables: ["contact_name", "company_name", "calendar_link", "sender_name"],
    description: "A warm welcome email for new leads who have shown interest",
    previewText: "Welcome to our community! Let's get started on your journey..."
  },
  {
    id: "follow_up_sequence",
    name: "Follow-up Sequence",
    category: "follow_up",
    subject: "Following up on your interest in {{service_name}}",
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px;">Following Up</h2>
        <p style="font-size: 16px; color: #333;">Hi {{contact_name}},</p>
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          I wanted to follow up on your recent interest in {{service_name}}. I understand you might be busy, but I didn't want this opportunity to slip through the cracks.
        </p>
        <div style="background: #f0f8f0; padding: 20px; border-left: 4px solid #4CAF50; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Quick Benefits Reminder:</h3>
          <ul style="color: #333;">
            <li>{{benefit_1}}</li>
            <li>{{benefit_2}}</li>
            <li>{{benefit_3}}</li>
          </ul>
        </div>
        <p style="font-size: 16px; color: #333;">
          Would you like to schedule a quick 15-minute call to discuss how this could benefit your business?
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{calendar_link}}" style="background: #2196F3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Book a Call</a>
        </div>
        <p style="font-size: 14px; color: #666;">
          {{sender_name}}<br>
          {{company_name}}<br>
          {{phone_number}}
        </p>
      </div>
    `,
    textContent: `
Hi {{contact_name}},

I wanted to follow up on your recent interest in {{service_name}}. I understand you might be busy, but I didn't want this opportunity to slip through the cracks.

Quick Benefits Reminder:
• {{benefit_1}}
• {{benefit_2}}
• {{benefit_3}}

Would you like to schedule a quick 15-minute call to discuss how this could benefit your business?

Book a call: {{calendar_link}}

{{sender_name}}
{{company_name}}
{{phone_number}}
    `,
    variables: ["contact_name", "service_name", "benefit_1", "benefit_2", "benefit_3", "calendar_link", "sender_name", "company_name", "phone_number"],
    description: "Professional follow-up email for prospects who haven't responded",
    previewText: "Just checking in about your interest in our services..."
  },
  {
    id: "nurturing_campaign",
    name: "Educational Nurturing",
    category: "nurturing",
    subject: "{{resource_title}} - A resource for {{contact_name}}",
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="{{company_logo}}" alt="{{company_name}}" style="max-height: 60px;">
        </div>
        <h2 style="color: #333;">{{resource_title}}</h2>
        <p style="font-size: 16px; color: #333;">Hi {{contact_name}},</p>
        <p style="font-size: 16px; color: #333; line-height: 1.6;">
          I thought you might find this resource valuable based on your interest in {{topic_area}}.
        </p>
        <div style="background: #fff; border: 1px solid #ddd; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">{{resource_title}}</h3>
          <p style="color: #666; font-size: 14px;">{{resource_description}}</p>
          <div style="text-align: center; margin-top: 20px;">
            <a href="{{resource_link}}" style="background: #FF5722; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Download Now</a>
          </div>
        </div>
        <p style="font-size: 16px; color: #333;">
          This resource has helped hundreds of businesses like yours improve their {{improvement_area}}.
        </p>
        <p style="font-size: 14px; color: #666;">
          If you have any questions or would like to discuss how this applies to your specific situation, feel free to reply to this email.
        </p>
        <p style="font-size: 14px; color: #666;">
          Best regards,<br>
          {{sender_name}}<br>
          {{company_name}}
        </p>
      </div>
    `,
    textContent: `
Hi {{contact_name}},

I thought you might find this resource valuable based on your interest in {{topic_area}}.

{{resource_title}}
{{resource_description}}

Download: {{resource_link}}

This resource has helped hundreds of businesses like yours improve their {{improvement_area}}.

If you have any questions or would like to discuss how this applies to your specific situation, feel free to reply to this email.

Best regards,
{{sender_name}}
{{company_name}}
    `,
    variables: ["contact_name", "resource_title", "topic_area", "resource_description", "resource_link", "improvement_area", "sender_name", "company_name", "company_logo"],
    description: "Educational content to nurture leads with valuable resources",
    previewText: "Here's a valuable resource that might interest you..."
  },
  {
    id: "meeting_reminder",
    name: "Meeting Reminder",
    category: "reminder",
    subject: "Reminder: Our meeting tomorrow at {{meeting_time}}",
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #E3F2FD; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
          <h2 style="color: #1976D2; margin: 0;">Meeting Reminder</h2>
        </div>
        <p style="font-size: 16px; color: #333;">Hi {{contact_name}},</p>
        <p style="font-size: 16px; color: #333;">
          This is a friendly reminder about our upcoming meeting:
        </p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #666; font-weight: bold;">Date:</td>
              <td style="padding: 8px 0; color: #333;">{{meeting_date}}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666; font-weight: bold;">Time:</td>
              <td style="padding: 8px 0; color: #333;">{{meeting_time}}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666; font-weight: bold;">Duration:</td>
              <td style="padding: 8px 0; color: #333;">{{duration}}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666; font-weight: bold;">Location:</td>
              <td style="padding: 8px 0; color: #333;">{{meeting_location}}</td>
            </tr>
          </table>
        </div>
        <div style="background: #FFF3E0; padding: 15px; border-radius: 5px; border-left: 4px solid #FF9800;">
          <p style="margin: 0; color: #333; font-size: 14px;">
            <strong>Agenda:</strong> {{meeting_agenda}}
          </p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{meeting_link}}" style="background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Join Meeting</a>
        </div>
        <p style="font-size: 14px; color: #666;">
          Looking forward to speaking with you!<br><br>
          {{sender_name}}<br>
          {{company_name}}
        </p>
      </div>
    `,
    textContent: `
Hi {{contact_name}},

This is a friendly reminder about our upcoming meeting:

Date: {{meeting_date}}
Time: {{meeting_time}}
Duration: {{duration}}
Location: {{meeting_location}}

Agenda: {{meeting_agenda}}

Join meeting: {{meeting_link}}

Looking forward to speaking with you!

{{sender_name}}
{{company_name}}
    `,
    variables: ["contact_name", "meeting_date", "meeting_time", "duration", "meeting_location", "meeting_agenda", "meeting_link", "sender_name", "company_name"],
    description: "Automated reminder for scheduled meetings",
    previewText: "Don't forget about our meeting tomorrow..."
  },
  {
    id: "high_value_notification",
    name: "High-Value Lead Alert",
    category: "notification",
    subject: "🚨 High-Value Lead Alert: {{contact_name}}",
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%); padding: 20px; text-align: center; border-radius: 8px; margin-bottom: 20px;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🚨 High-Value Lead Alert</h1>
        </div>
        <div style="background: #fff; border: 2px solid #FF6B6B; padding: 20px; border-radius: 8px;">
          <h2 style="color: #333; margin-top: 0;">Lead Details</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #666; font-weight: bold; width: 30%;">Name:</td>
              <td style="padding: 8px 0; color: #333;">{{contact_name}}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666; font-weight: bold;">Company:</td>
              <td style="padding: 8px 0; color: #333;">{{contact_company}}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666; font-weight: bold;">Score:</td>
              <td style="padding: 8px 0; color: #333; font-weight: bold; color: #FF6B6B;">{{lead_score}}/100</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666; font-weight: bold;">Est. Value:</td>
              <td style="padding: 8px 0; color: #333; font-weight: bold; color: #4CAF50;">{{estimated_value}}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666; font-weight: bold;">Source:</td>
              <td style="padding: 8px 0; color: #333;">{{lead_source}}</td>
            </tr>
          </table>
        </div>
        <div style="background: #F44336; color: white; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <p style="margin: 0; font-weight: bold;">⏰ URGENT: This lead requires immediate attention!</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{crm_link}}" style="background: #2196F3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-right: 10px;">View in CRM</a>
          <a href="tel:{{contact_phone}}" style="background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Call Now</a>
        </div>
        <p style="font-size: 12px; color: #666; text-align: center;">
          This alert was automatically generated based on your lead scoring criteria.
        </p>
      </div>
    `,
    textContent: `
🚨 HIGH-VALUE LEAD ALERT 🚨

Lead Details:
Name: {{contact_name}}
Company: {{contact_company}}
Score: {{lead_score}}/100
Est. Value: {{estimated_value}}
Source: {{lead_source}}

⏰ URGENT: This lead requires immediate attention!

View in CRM: {{crm_link}}
Call: {{contact_phone}}

This alert was automatically generated based on your lead scoring criteria.
    `,
    variables: ["contact_name", "contact_company", "lead_score", "estimated_value", "lead_source", "crm_link", "contact_phone"],
    description: "Urgent notification for high-value leads that need immediate attention",
    previewText: "High-value lead alert requiring immediate attention..."
  },
  {
    id: "promotional_offer",
    name: "Limited Time Promotion",
    category: "promotion",
    subject: "{{discount_percent}}% OFF {{service_name}} - Limited Time!",
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 32px;">{{discount_percent}}% OFF</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 18px;">Limited Time Offer!</p>
        </div>
        <div style="background: #fff; border: 2px solid #FF9800; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; color: #333;">Hi {{contact_name}},</p>
          <p style="font-size: 16px; color: #333; line-height: 1.6;">
            Great news! For a limited time, we're offering {{discount_percent}}% off our {{service_name}} package.
          </p>
          <div style="background: #FFF3E0; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <h3 style="color: #FF9800; margin-top: 0;">Special Pricing</h3>
            <p style="font-size: 24px; color: #333; margin: 10px 0;">
              <span style="text-decoration: line-through; color: #999;">{{original_price}}</span>
              <span style="color: #4CAF50; font-weight: bold; margin-left: 10px;">{{discounted_price}}</span>
            </p>
            <p style="color: #666; font-size: 14px;">Save {{savings_amount}}!</p>
          </div>
          <div style="background: #E8F5E8; padding: 15px; border-radius: 5px; border-left: 4px solid #4CAF50;">
            <p style="margin: 0; color: #333;">
              <strong>⏰ Offer expires:</strong> {{expiry_date}}
            </p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{offer_link}}" style="background: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 18px;">Claim Offer Now</a>
          </div>
          <p style="font-size: 14px; color: #666;">
            Questions? Reply to this email or call {{phone_number}}.<br><br>
            Best regards,<br>
            {{sender_name}}<br>
            {{company_name}}
          </p>
        </div>
      </div>
    `,
    textContent: `
{{discount_percent}}% OFF - Limited Time Offer!

Hi {{contact_name}},

Great news! For a limited time, we're offering {{discount_percent}}% off our {{service_name}} package.

Special Pricing:
Was: {{original_price}}
Now: {{discounted_price}}
You Save: {{savings_amount}}

⏰ Offer expires: {{expiry_date}}

Claim your offer: {{offer_link}}

Questions? Reply to this email or call {{phone_number}}.

Best regards,
{{sender_name}}
{{company_name}}
    `,
    variables: ["contact_name", "discount_percent", "service_name", "original_price", "discounted_price", "savings_amount", "expiry_date", "offer_link", "phone_number", "sender_name", "company_name"],
    description: "Promotional email with limited-time discount offers",
    previewText: "Don't miss out on this exclusive limited-time offer..."
  }
];

export const getTemplatesByCategory = (category: EmailTemplate["category"]) => {
  return emailTemplates.filter(template => template.category === category);
};

export const getTemplateById = (id: string) => {
  return emailTemplates.find(template => template.id === id);
};

export const replaceVariables = (content: string, variables: Record<string, string>) => {
  let result = content;
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value);
  });
  return result;
};