import { useState } from 'react';
import Layout from '../components/Layout';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

export default function FAQ() {
  const [openQuestion, setOpenQuestion] = useState(null);

  const toggleQuestion = (index) => {
    if (openQuestion === index) {
      setOpenQuestion(null);
    } else {
      setOpenQuestion(index);
    }
  };

  const faqs = [
    {
      question: 'What is Social Media Analytics Platform?',
      answer: 'Social Media Analytics Platform is a tool that helps content creators and social media managers predict engagement on their posts. Using machine learning algorithms, we analyze your content and provide insights on expected likes, comments, and shares, helping you optimize your social media strategy.'
    },
    {
      question: 'How accurate are the predictions?',
      answer: 'Our prediction model is continuously improving and currently achieves an average accuracy of 80-85% for engagement predictions. The accuracy may vary depending on factors such as content type, audience behavior changes, and platform algorithm updates. We provide confidence intervals with our predictions to give you a range of expected outcomes.'
    },
    {
      question: 'What social media platforms do you support?',
      answer: 'Currently, we support data analysis and predictions for major platforms including Instagram, Facebook, Twitter, LinkedIn, and TikTok. We\'re constantly working to expand our platform support based on user demand.'
    },
    {
      question: 'How do I connect my social media accounts?',
      answer: 'After creating an account, navigate to the Settings page and select "Connect Accounts". You\'ll be guided through the authentication process for each platform you wish to connect. We use secure OAuth protocols to ensure your account credentials are never stored on our servers.'
    },
    {
      question: 'What data do you collect from my social media accounts?',
      answer: 'We collect engagement metrics (likes, comments, shares), post content, posting times, and audience demographics when available. We do not collect private messages, browsing history, or personal information beyond what is necessary for our analytics. Please refer to our Privacy Policy for more details.'
    },
    {
      question: 'Can I use the platform without connecting my social media accounts?',
      answer: 'Yes, you can manually input post details to get predictions without connecting your accounts. However, connecting your accounts provides more accurate predictions as our model can learn from your specific audience behavior and historical performance.'
    },
    {
      question: 'How often should I update my actual engagement metrics?',
      answer: 'For the most accurate future predictions, we recommend updating your actual engagement metrics 24-48 hours after posting. This allows sufficient time for your content to receive engagement while ensuring our model has the most current data to learn from.'
    },
    {
      question: 'What features are included in the free plan?',
      answer: 'The free plan includes basic engagement predictions, limited historical data analysis, and support for up to two social media accounts. For additional features such as content optimization suggestions, best time to post recommendations, and unlimited predictions, please check our premium plans.'
    },
    {
      question: 'How do I cancel my subscription?',
      answer: 'You can cancel your subscription at any time by going to the Settings page and selecting "Subscription Management". Follow the prompts to cancel. Your access will continue until the end of your current billing period.'
    },
    {
      question: 'Is my data secure?',
      answer: 'Yes, we take data security very seriously. We use industry-standard encryption for data transmission and storage. We do not sell your personal data to third parties. Our platform complies with GDPR and other relevant data protection regulations.'
    },
    {
      question: 'How can I get help if I have a problem?',
      answer: 'For technical support or questions, you can contact our support team via the "Help" section in the application or by emailing support@socialmediaanalytics.com. We typically respond within 24 hours on business days.'
    },
    {
      question: 'Do you offer content creation services?',
      answer: 'Currently, we focus on analytics and predictions rather than content creation. However, our platform provides insights on what types of content perform best for your audience, which can guide your content creation strategy.'
    }
  ];

  return (
    <Layout title="Frequently Asked Questions">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h1>
        
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white shadow overflow-hidden rounded-lg">
              <button
                className="w-full px-6 py-4 text-left flex justify-between items-center focus:outline-none"
                onClick={() => toggleQuestion(index)}
              >
                <span className="text-lg font-medium text-gray-900">{faq.question}</span>
                {openQuestion === index ? (
                  <FaChevronUp className="h-5 w-5 text-primary-500" />
                ) : (
                  <FaChevronDown className="h-5 w-5 text-primary-500" />
                )}
              </button>
              {openQuestion === index && (
                <div className="px-6 py-4 border-t border-gray-200">
                  <p className="text-base text-gray-700">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 bg-primary-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-primary-800 mb-4">Still have questions?</h2>
          <p className="text-primary-700 mb-4">
            If you couldn't find the answer to your question, please feel free to contact our support team.
          </p>
          <a
            href="mailto:support@socialmediaanalytics.com"
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Contact Support
          </a>
        </div>
      </div>
    </Layout>
  );
}