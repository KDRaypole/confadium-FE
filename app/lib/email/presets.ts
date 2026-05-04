import type { EmailComponentNode, EmailTheme } from '~/lib/api/types';

export interface EmailTemplatePreset {
  id: string;
  name: string;
  description: string;
  category: string;
  thumbnail: 'blank' | 'welcome' | 'newsletter' | 'promotion' | 'event' | 'transactional' | 'minimal';
  subject: string;
  previewText: string;
  components: EmailComponentNode[];
  theme: EmailTheme;
}

// ─────────────────────────────────────────────────────────────
// Blank Template
// ─────────────────────────────────────────────────────────────
const BLANK_TEMPLATE: EmailTemplatePreset = {
  id: 'blank',
  name: 'Blank Canvas',
  description: 'Start from scratch with a completely empty template',
  category: 'welcome',
  thumbnail: 'blank',
  subject: '',
  previewText: '',
  components: [],
  theme: {},
};

// ─────────────────────────────────────────────────────────────
// Welcome Email
// ─────────────────────────────────────────────────────────────
const WELCOME_TEMPLATE: EmailTemplatePreset = {
  id: 'welcome',
  name: 'Welcome Email',
  description: 'Onboard new users with a warm, professional welcome',
  category: 'welcome',
  thumbnail: 'welcome',
  subject: 'Welcome to {{company_name}}, {{first_name}}!',
  previewText: 'We\'re thrilled to have you join us. Here\'s how to get started...',
  components: [
    {
      id: 'welcome_header',
      type: 'EmailHeader',
      props: { logoUrl: '', logoAlt: '{{company_name}}', logoWidth: '160', backgroundColor: '#7c3aed' }
    },
    {
      id: 'welcome_spacer_1',
      type: 'EmailSpacer',
      props: { height: '32' }
    },
    {
      id: 'welcome_heading',
      type: 'EmailText',
      props: { content: 'Welcome aboard, {{first_name}}!', textType: 'heading', align: 'center', color: '#111827' }
    },
    {
      id: 'welcome_spacer_2',
      type: 'EmailSpacer',
      props: { height: '16' }
    },
    {
      id: 'welcome_intro',
      type: 'EmailText',
      props: {
        content: 'We\'re excited to have you join the {{company_name}} community. You\'ve taken the first step toward transforming the way you work, and we\'re here to support you every step of the way.',
        textType: 'body',
        align: 'center',
        color: '#4b5563'
      }
    },
    {
      id: 'welcome_spacer_3',
      type: 'EmailSpacer',
      props: { height: '24' }
    },
    {
      id: 'welcome_divider',
      type: 'EmailDivider',
      props: { color: '#e5e7eb', thickness: '1' }
    },
    {
      id: 'welcome_spacer_4',
      type: 'EmailSpacer',
      props: { height: '24' }
    },
    {
      id: 'welcome_steps_heading',
      type: 'EmailText',
      props: { content: 'Get Started in 3 Easy Steps', textType: 'heading', align: 'left', color: '#111827' }
    },
    {
      id: 'welcome_spacer_5',
      type: 'EmailSpacer',
      props: { height: '16' }
    },
    {
      id: 'welcome_step_1',
      type: 'EmailText',
      props: { content: '1. Complete your profile — Add your details to personalize your experience', textType: 'body', align: 'left', color: '#4b5563' }
    },
    {
      id: 'welcome_step_2',
      type: 'EmailText',
      props: { content: '2. Explore the dashboard — Discover powerful features designed for you', textType: 'body', align: 'left', color: '#4b5563' }
    },
    {
      id: 'welcome_step_3',
      type: 'EmailText',
      props: { content: '3. Connect your tools — Integrate with your favorite apps seamlessly', textType: 'body', align: 'left', color: '#4b5563' }
    },
    {
      id: 'welcome_spacer_6',
      type: 'EmailSpacer',
      props: { height: '24' }
    },
    {
      id: 'welcome_cta',
      type: 'EmailButton',
      props: { text: 'Go to Dashboard', url: '{{dashboard_url}}', bgColor: '#7c3aed', textColor: '#ffffff', borderRadius: '8', width: '220' }
    },
    {
      id: 'welcome_spacer_7',
      type: 'EmailSpacer',
      props: { height: '32' }
    },
    {
      id: 'welcome_help',
      type: 'EmailText',
      props: {
        content: 'Need help? Our support team is available 24/7. Just reply to this email or visit our help center.',
        textType: 'body',
        align: 'center',
        color: '#6b7280'
      }
    },
    {
      id: 'welcome_spacer_8',
      type: 'EmailSpacer',
      props: { height: '24' }
    },
    {
      id: 'welcome_footer',
      type: 'EmailFooter',
      props: {
        text: '© 2026 {{company_name}}. All rights reserved.',
        unsubscribeUrl: '{{unsubscribe_url}}',
        companyAddress: '{{company_address}}'
      }
    }
  ],
  theme: {
    primaryColor: '#7c3aed',
    bodyBg: '#f3f4f6',
    contentBg: '#ffffff',
  },
};

// ─────────────────────────────────────────────────────────────
// Newsletter Template
// ─────────────────────────────────────────────────────────────
const NEWSLETTER_TEMPLATE: EmailTemplatePreset = {
  id: 'newsletter',
  name: 'Newsletter',
  description: 'Content-rich newsletter with featured articles and columns',
  category: 'nurturing',
  thumbnail: 'newsletter',
  subject: '{{newsletter_title}} — {{month}} Edition',
  previewText: 'This month: {{featured_topic}} and more updates from our team',
  components: [
    {
      id: 'news_header',
      type: 'EmailHeader',
      props: { logoUrl: '', logoAlt: '{{company_name}}', logoWidth: '140', backgroundColor: '#1e40af' }
    },
    {
      id: 'news_spacer_1',
      type: 'EmailSpacer',
      props: { height: '24' }
    },
    {
      id: 'news_date',
      type: 'EmailText',
      props: { content: '{{month}} {{year}} Newsletter', textType: 'body', align: 'center', color: '#6b7280' }
    },
    {
      id: 'news_title',
      type: 'EmailText',
      props: { content: '{{newsletter_title}}', textType: 'heading', align: 'center', color: '#111827' }
    },
    {
      id: 'news_spacer_2',
      type: 'EmailSpacer',
      props: { height: '24' }
    },
    {
      id: 'news_hero_image',
      type: 'EmailImage',
      props: { src: '{{hero_image_url}}', alt: 'Featured Image', width: '520', linkUrl: '' }
    },
    {
      id: 'news_spacer_3',
      type: 'EmailSpacer',
      props: { height: '24' }
    },
    {
      id: 'news_featured_title',
      type: 'EmailText',
      props: { content: '{{featured_article_title}}', textType: 'heading', align: 'left', color: '#111827' }
    },
    {
      id: 'news_featured_content',
      type: 'EmailText',
      props: {
        content: '{{featured_article_excerpt}}',
        textType: 'body',
        align: 'left',
        color: '#4b5563'
      }
    },
    {
      id: 'news_read_more',
      type: 'EmailButton',
      props: { text: 'Read Full Article', url: '{{featured_article_url}}', bgColor: '#1e40af', textColor: '#ffffff', borderRadius: '6', width: '180' }
    },
    {
      id: 'news_spacer_4',
      type: 'EmailSpacer',
      props: { height: '32' }
    },
    {
      id: 'news_divider',
      type: 'EmailDivider',
      props: { color: '#e5e7eb', thickness: '1' }
    },
    {
      id: 'news_spacer_5',
      type: 'EmailSpacer',
      props: { height: '24' }
    },
    {
      id: 'news_more_title',
      type: 'EmailText',
      props: { content: 'More Stories', textType: 'heading', align: 'left', color: '#111827' }
    },
    {
      id: 'news_spacer_6',
      type: 'EmailSpacer',
      props: { height: '16' }
    },
    {
      id: 'news_columns',
      type: 'EmailColumns',
      props: {
        columns: 2,
        columnContent: [
          { content: '<strong style="color:#111827;">{{article_2_title}}</strong><br><span style="color:#6b7280;font-size:14px;">{{article_2_excerpt}}</span>' },
          { content: '<strong style="color:#111827;">{{article_3_title}}</strong><br><span style="color:#6b7280;font-size:14px;">{{article_3_excerpt}}</span>' }
        ]
      }
    },
    {
      id: 'news_spacer_7',
      type: 'EmailSpacer',
      props: { height: '32' }
    },
    {
      id: 'news_social',
      type: 'EmailSocial',
      props: {
        networks: [
          { name: 'Twitter', url: '{{twitter_url}}' },
          { name: 'LinkedIn', url: '{{linkedin_url}}' },
          { name: 'Instagram', url: '{{instagram_url}}' }
        ]
      }
    },
    {
      id: 'news_footer',
      type: 'EmailFooter',
      props: {
        text: '© 2026 {{company_name}}. You\'re receiving this because you subscribed to our newsletter.',
        unsubscribeUrl: '{{unsubscribe_url}}',
        companyAddress: '{{company_address}}'
      }
    }
  ],
  theme: {
    primaryColor: '#1e40af',
    bodyBg: '#f8fafc',
    contentBg: '#ffffff',
    linkColor: '#1e40af',
  },
};

// ─────────────────────────────────────────────────────────────
// Product Announcement / Promotion
// ─────────────────────────────────────────────────────────────
const PROMOTION_TEMPLATE: EmailTemplatePreset = {
  id: 'promotion',
  name: 'Product Launch',
  description: 'Announce new products or features with impact',
  category: 'promotion',
  thumbnail: 'promotion',
  subject: 'Introducing {{product_name}} — {{tagline}}',
  previewText: 'Be the first to experience {{product_name}}. Available now.',
  components: [
    {
      id: 'promo_header',
      type: 'EmailHeader',
      props: { logoUrl: '', logoAlt: '{{company_name}}', logoWidth: '120', backgroundColor: '#000000' }
    },
    {
      id: 'promo_hero',
      type: 'EmailImage',
      props: { src: '{{product_hero_image}}', alt: '{{product_name}}', width: '600', linkUrl: '{{product_url}}' }
    },
    {
      id: 'promo_spacer_1',
      type: 'EmailSpacer',
      props: { height: '32' }
    },
    {
      id: 'promo_badge',
      type: 'EmailText',
      props: { content: '✨ NEW RELEASE', textType: 'body', align: 'center', color: '#f59e0b' }
    },
    {
      id: 'promo_title',
      type: 'EmailText',
      props: { content: 'Introducing {{product_name}}', textType: 'heading', align: 'center', color: '#111827' }
    },
    {
      id: 'promo_tagline',
      type: 'EmailText',
      props: { content: '{{product_tagline}}', textType: 'body', align: 'center', color: '#6b7280' }
    },
    {
      id: 'promo_spacer_2',
      type: 'EmailSpacer',
      props: { height: '24' }
    },
    {
      id: 'promo_cta_primary',
      type: 'EmailButton',
      props: { text: 'Shop Now', url: '{{product_url}}', bgColor: '#111827', textColor: '#ffffff', borderRadius: '50', width: '200' }
    },
    {
      id: 'promo_spacer_3',
      type: 'EmailSpacer',
      props: { height: '32' }
    },
    {
      id: 'promo_divider',
      type: 'EmailDivider',
      props: { color: '#e5e7eb', thickness: '1' }
    },
    {
      id: 'promo_spacer_4',
      type: 'EmailSpacer',
      props: { height: '24' }
    },
    {
      id: 'promo_features_title',
      type: 'EmailText',
      props: { content: 'What Makes It Special', textType: 'heading', align: 'center', color: '#111827' }
    },
    {
      id: 'promo_spacer_5',
      type: 'EmailSpacer',
      props: { height: '16' }
    },
    {
      id: 'promo_features',
      type: 'EmailColumns',
      props: {
        columns: 3,
        columnContent: [
          { content: '<div style="text-align:center;"><strong style="color:#111827;font-size:18px;">⚡</strong><br><strong style="color:#111827;">Lightning Fast</strong><br><span style="color:#6b7280;font-size:13px;">{{feature_1_desc}}</span></div>' },
          { content: '<div style="text-align:center;"><strong style="color:#111827;font-size:18px;">🔒</strong><br><strong style="color:#111827;">Secure</strong><br><span style="color:#6b7280;font-size:13px;">{{feature_2_desc}}</span></div>' },
          { content: '<div style="text-align:center;"><strong style="color:#111827;font-size:18px;">🎨</strong><br><strong style="color:#111827;">Beautiful</strong><br><span style="color:#6b7280;font-size:13px;">{{feature_3_desc}}</span></div>' }
        ]
      }
    },
    {
      id: 'promo_spacer_6',
      type: 'EmailSpacer',
      props: { height: '32' }
    },
    {
      id: 'promo_pricing',
      type: 'EmailText',
      props: { content: 'Starting at {{product_price}}', textType: 'heading', align: 'center', color: '#059669' }
    },
    {
      id: 'promo_spacer_7',
      type: 'EmailSpacer',
      props: { height: '16' }
    },
    {
      id: 'promo_cta_secondary',
      type: 'EmailButton',
      props: { text: 'Learn More', url: '{{learn_more_url}}', bgColor: '#ffffff', textColor: '#111827', borderRadius: '50', width: '160' }
    },
    {
      id: 'promo_spacer_8',
      type: 'EmailSpacer',
      props: { height: '32' }
    },
    {
      id: 'promo_footer',
      type: 'EmailFooter',
      props: {
        text: '© 2026 {{company_name}}',
        unsubscribeUrl: '{{unsubscribe_url}}',
        companyAddress: ''
      }
    }
  ],
  theme: {
    primaryColor: '#111827',
    bodyBg: '#ffffff',
    contentBg: '#ffffff',
  },
};

// ─────────────────────────────────────────────────────────────
// Event Invitation
// ─────────────────────────────────────────────────────────────
const EVENT_TEMPLATE: EmailTemplatePreset = {
  id: 'event',
  name: 'Event Invitation',
  description: 'Invite attendees to webinars, conferences, or meetups',
  category: 'notification',
  thumbnail: 'event',
  subject: 'You\'re Invited: {{event_name}} on {{event_date}}',
  previewText: 'Join us for {{event_name}}. Reserve your spot today.',
  components: [
    {
      id: 'event_header',
      type: 'EmailHeader',
      props: { logoUrl: '', logoAlt: '{{company_name}}', logoWidth: '140', backgroundColor: '#7c3aed' }
    },
    {
      id: 'event_spacer_1',
      type: 'EmailSpacer',
      props: { height: '32' }
    },
    {
      id: 'event_invite_text',
      type: 'EmailText',
      props: { content: 'YOU\'RE INVITED', textType: 'body', align: 'center', color: '#7c3aed' }
    },
    {
      id: 'event_title',
      type: 'EmailText',
      props: { content: '{{event_name}}', textType: 'heading', align: 'center', color: '#111827' }
    },
    {
      id: 'event_spacer_2',
      type: 'EmailSpacer',
      props: { height: '16' }
    },
    {
      id: 'event_image',
      type: 'EmailImage',
      props: { src: '{{event_image_url}}', alt: '{{event_name}}', width: '520', linkUrl: '' }
    },
    {
      id: 'event_spacer_3',
      type: 'EmailSpacer',
      props: { height: '24' }
    },
    {
      id: 'event_description',
      type: 'EmailText',
      props: {
        content: '{{event_description}}',
        textType: 'body',
        align: 'center',
        color: '#4b5563'
      }
    },
    {
      id: 'event_spacer_4',
      type: 'EmailSpacer',
      props: { height: '24' }
    },
    {
      id: 'event_details',
      type: 'EmailColumns',
      props: {
        columns: 2,
        columnContent: [
          { content: '<div style="text-align:center;padding:16px;background:#f9fafb;border-radius:8px;"><strong style="color:#6b7280;font-size:12px;text-transform:uppercase;">Date & Time</strong><br><strong style="color:#111827;font-size:16px;">{{event_date}}</strong><br><span style="color:#6b7280;">{{event_time}}</span></div>' },
          { content: '<div style="text-align:center;padding:16px;background:#f9fafb;border-radius:8px;"><strong style="color:#6b7280;font-size:12px;text-transform:uppercase;">Location</strong><br><strong style="color:#111827;font-size:16px;">{{event_location}}</strong><br><span style="color:#6b7280;">{{event_venue}}</span></div>' }
        ]
      }
    },
    {
      id: 'event_spacer_5',
      type: 'EmailSpacer',
      props: { height: '24' }
    },
    {
      id: 'event_cta',
      type: 'EmailButton',
      props: { text: 'Register Now', url: '{{registration_url}}', bgColor: '#7c3aed', textColor: '#ffffff', borderRadius: '8', width: '200' }
    },
    {
      id: 'event_spacer_6',
      type: 'EmailSpacer',
      props: { height: '16' }
    },
    {
      id: 'event_calendar',
      type: 'EmailText',
      props: { content: '<a href="{{calendar_url}}" style="color:#7c3aed;">Add to Calendar</a>', textType: 'body', align: 'center', color: '#7c3aed' }
    },
    {
      id: 'event_spacer_7',
      type: 'EmailSpacer',
      props: { height: '32' }
    },
    {
      id: 'event_speakers_title',
      type: 'EmailText',
      props: { content: 'Featured Speakers', textType: 'heading', align: 'center', color: '#111827' }
    },
    {
      id: 'event_spacer_8',
      type: 'EmailSpacer',
      props: { height: '16' }
    },
    {
      id: 'event_speakers',
      type: 'EmailColumns',
      props: {
        columns: 2,
        columnContent: [
          { content: '<div style="text-align:center;"><strong style="color:#111827;">{{speaker_1_name}}</strong><br><span style="color:#6b7280;font-size:13px;">{{speaker_1_title}}</span></div>' },
          { content: '<div style="text-align:center;"><strong style="color:#111827;">{{speaker_2_name}}</strong><br><span style="color:#6b7280;font-size:13px;">{{speaker_2_title}}</span></div>' }
        ]
      }
    },
    {
      id: 'event_spacer_9',
      type: 'EmailSpacer',
      props: { height: '32' }
    },
    {
      id: 'event_footer',
      type: 'EmailFooter',
      props: {
        text: '© 2026 {{company_name}}. Questions? Reply to this email.',
        unsubscribeUrl: '{{unsubscribe_url}}',
        companyAddress: '{{company_address}}'
      }
    }
  ],
  theme: {
    primaryColor: '#7c3aed',
    bodyBg: '#f5f3ff',
    contentBg: '#ffffff',
    linkColor: '#7c3aed',
  },
};

// ─────────────────────────────────────────────────────────────
// Transactional / Order Confirmation
// ─────────────────────────────────────────────────────────────
const TRANSACTIONAL_TEMPLATE: EmailTemplatePreset = {
  id: 'transactional',
  name: 'Order Confirmation',
  description: 'Confirm orders with professional receipt details',
  category: 'notification',
  thumbnail: 'transactional',
  subject: 'Order Confirmed — #{{order_number}}',
  previewText: 'Thank you for your order! Here are the details...',
  components: [
    {
      id: 'order_header',
      type: 'EmailHeader',
      props: { logoUrl: '', logoAlt: '{{company_name}}', logoWidth: '140', backgroundColor: '#059669' }
    },
    {
      id: 'order_spacer_1',
      type: 'EmailSpacer',
      props: { height: '32' }
    },
    {
      id: 'order_checkmark',
      type: 'EmailText',
      props: { content: '✓', textType: 'heading', align: 'center', color: '#059669' }
    },
    {
      id: 'order_title',
      type: 'EmailText',
      props: { content: 'Order Confirmed!', textType: 'heading', align: 'center', color: '#111827' }
    },
    {
      id: 'order_number',
      type: 'EmailText',
      props: { content: 'Order #{{order_number}}', textType: 'body', align: 'center', color: '#6b7280' }
    },
    {
      id: 'order_spacer_2',
      type: 'EmailSpacer',
      props: { height: '16' }
    },
    {
      id: 'order_thanks',
      type: 'EmailText',
      props: {
        content: 'Hi {{first_name}}, thank you for your order. We\'re getting it ready to ship and will notify you when it\'s on its way.',
        textType: 'body',
        align: 'center',
        color: '#4b5563'
      }
    },
    {
      id: 'order_spacer_3',
      type: 'EmailSpacer',
      props: { height: '24' }
    },
    {
      id: 'order_track_btn',
      type: 'EmailButton',
      props: { text: 'Track Your Order', url: '{{tracking_url}}', bgColor: '#059669', textColor: '#ffffff', borderRadius: '6', width: '180' }
    },
    {
      id: 'order_spacer_4',
      type: 'EmailSpacer',
      props: { height: '32' }
    },
    {
      id: 'order_divider_1',
      type: 'EmailDivider',
      props: { color: '#e5e7eb', thickness: '1' }
    },
    {
      id: 'order_spacer_5',
      type: 'EmailSpacer',
      props: { height: '24' }
    },
    {
      id: 'order_summary_title',
      type: 'EmailText',
      props: { content: 'Order Summary', textType: 'heading', align: 'left', color: '#111827' }
    },
    {
      id: 'order_spacer_6',
      type: 'EmailSpacer',
      props: { height: '16' }
    },
    {
      id: 'order_items',
      type: 'EmailColumns',
      props: {
        columns: 2,
        columnContent: [
          { content: '<span style="color:#111827;">{{item_1_name}}</span><br><span style="color:#6b7280;font-size:13px;">Qty: {{item_1_qty}}</span>' },
          { content: '<span style="color:#111827;text-align:right;display:block;">{{item_1_price}}</span>' }
        ]
      }
    },
    {
      id: 'order_spacer_7',
      type: 'EmailSpacer',
      props: { height: '8' }
    },
    {
      id: 'order_items_2',
      type: 'EmailColumns',
      props: {
        columns: 2,
        columnContent: [
          { content: '<span style="color:#111827;">{{item_2_name}}</span><br><span style="color:#6b7280;font-size:13px;">Qty: {{item_2_qty}}</span>' },
          { content: '<span style="color:#111827;text-align:right;display:block;">{{item_2_price}}</span>' }
        ]
      }
    },
    {
      id: 'order_spacer_8',
      type: 'EmailSpacer',
      props: { height: '16' }
    },
    {
      id: 'order_divider_2',
      type: 'EmailDivider',
      props: { color: '#e5e7eb', thickness: '1' }
    },
    {
      id: 'order_spacer_9',
      type: 'EmailSpacer',
      props: { height: '16' }
    },
    {
      id: 'order_totals',
      type: 'EmailColumns',
      props: {
        columns: 2,
        columnContent: [
          { content: '<span style="color:#6b7280;">Subtotal</span><br><span style="color:#6b7280;">Shipping</span><br><strong style="color:#111827;font-size:16px;">Total</strong>' },
          { content: '<span style="color:#111827;text-align:right;display:block;">{{subtotal}}</span><span style="color:#111827;text-align:right;display:block;">{{shipping}}</span><strong style="color:#111827;font-size:16px;text-align:right;display:block;">{{total}}</strong>' }
        ]
      }
    },
    {
      id: 'order_spacer_10',
      type: 'EmailSpacer',
      props: { height: '32' }
    },
    {
      id: 'order_shipping_title',
      type: 'EmailText',
      props: { content: 'Shipping Address', textType: 'heading', align: 'left', color: '#111827' }
    },
    {
      id: 'order_shipping_address',
      type: 'EmailText',
      props: {
        content: '{{shipping_name}}<br>{{shipping_address}}<br>{{shipping_city}}, {{shipping_state}} {{shipping_zip}}',
        textType: 'body',
        align: 'left',
        color: '#4b5563'
      }
    },
    {
      id: 'order_spacer_11',
      type: 'EmailSpacer',
      props: { height: '32' }
    },
    {
      id: 'order_footer',
      type: 'EmailFooter',
      props: {
        text: '© 2026 {{company_name}}. Need help? Contact us at {{support_email}}',
        unsubscribeUrl: '',
        companyAddress: '{{company_address}}'
      }
    }
  ],
  theme: {
    primaryColor: '#059669',
    bodyBg: '#f0fdf4',
    contentBg: '#ffffff',
    linkColor: '#059669',
  },
};

// ─────────────────────────────────────────────────────────────
// Minimal / Simple
// ─────────────────────────────────────────────────────────────
const MINIMAL_TEMPLATE: EmailTemplatePreset = {
  id: 'minimal',
  name: 'Minimal',
  description: 'Clean, simple design for straightforward messages',
  category: 'follow_up',
  thumbnail: 'minimal',
  subject: 'Quick update from {{company_name}}',
  previewText: 'Hi {{first_name}}, just wanted to reach out...',
  components: [
    {
      id: 'min_spacer_1',
      type: 'EmailSpacer',
      props: { height: '40' }
    },
    {
      id: 'min_greeting',
      type: 'EmailText',
      props: { content: 'Hi {{first_name}},', textType: 'body', align: 'left', color: '#111827' }
    },
    {
      id: 'min_spacer_2',
      type: 'EmailSpacer',
      props: { height: '16' }
    },
    {
      id: 'min_body_1',
      type: 'EmailText',
      props: {
        content: 'I hope this email finds you well. I wanted to reach out personally to share some exciting news with you.',
        textType: 'body',
        align: 'left',
        color: '#374151'
      }
    },
    {
      id: 'min_spacer_3',
      type: 'EmailSpacer',
      props: { height: '16' }
    },
    {
      id: 'min_body_2',
      type: 'EmailText',
      props: {
        content: '{{message_body}}',
        textType: 'body',
        align: 'left',
        color: '#374151'
      }
    },
    {
      id: 'min_spacer_4',
      type: 'EmailSpacer',
      props: { height: '24' }
    },
    {
      id: 'min_cta',
      type: 'EmailButton',
      props: { text: '{{cta_text}}', url: '{{cta_url}}', bgColor: '#374151', textColor: '#ffffff', borderRadius: '4', width: '160' }
    },
    {
      id: 'min_spacer_5',
      type: 'EmailSpacer',
      props: { height: '32' }
    },
    {
      id: 'min_signoff',
      type: 'EmailText',
      props: { content: 'Best regards,<br>{{sender_name}}<br><span style="color:#6b7280;">{{sender_title}}</span>', textType: 'body', align: 'left', color: '#111827' }
    },
    {
      id: 'min_spacer_6',
      type: 'EmailSpacer',
      props: { height: '40' }
    },
    {
      id: 'min_divider',
      type: 'EmailDivider',
      props: { color: '#e5e7eb', thickness: '1' }
    },
    {
      id: 'min_footer',
      type: 'EmailFooter',
      props: {
        text: '{{company_name}}',
        unsubscribeUrl: '{{unsubscribe_url}}',
        companyAddress: ''
      }
    }
  ],
  theme: {
    primaryColor: '#374151',
    bodyBg: '#ffffff',
    contentBg: '#ffffff',
  },
};

// ─────────────────────────────────────────────────────────────
// Export all presets
// ─────────────────────────────────────────────────────────────
export const EMAIL_TEMPLATE_PRESETS: EmailTemplatePreset[] = [
  BLANK_TEMPLATE,
  WELCOME_TEMPLATE,
  NEWSLETTER_TEMPLATE,
  PROMOTION_TEMPLATE,
  EVENT_TEMPLATE,
  TRANSACTIONAL_TEMPLATE,
  MINIMAL_TEMPLATE,
];

export function getPresetById(id: string): EmailTemplatePreset | undefined {
  return EMAIL_TEMPLATE_PRESETS.find(p => p.id === id);
}
