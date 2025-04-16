declare module '@mailchimp/mailchimp_marketing' {
  interface MailchimpConfig {
    apiKey: string;
    server: string;
  }

  interface MailchimpListMember {
    email_address: string;
    status: 'subscribed' | 'unsubscribed' | 'cleaned' | 'pending';
    merge_fields?: Record<string, any>;
    tags?: string[];
  }

  interface MailchimpResponse {
    id: string;
    email_address: string;
    status: string;
    [key: string]: any;
  }

  interface MailchimpLists {
    addListMember(listId: string, data: MailchimpListMember): Promise<MailchimpResponse>;
  }

  interface Mailchimp {
    setConfig(config: MailchimpConfig): void;
    lists: MailchimpLists;
  }

  const mailchimp: Mailchimp;
  export default mailchimp;
}
