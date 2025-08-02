import Layout from '../components/Layout';

export default function TermsOfService() {
  return (
    <Layout title="Terms of Service">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
        
        <div className="prose prose-indigo max-w-none">
          <p className="text-lg mb-4">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">1. Introduction</h2>
          <p>
            Welcome to Social Media Analytics Platform. These Terms of Service ("Terms") govern your use of our website and services 
            (collectively, the "Service") operated by Social Media Analytics Platform ("us", "we", or "our").
          </p>
          <p className="mt-2">
            By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of the terms, 
            you may not access the Service.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">2. Accounts</h2>
          <p>
            When you create an account with us, you must provide information that is accurate, complete, and current at all times. 
            Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
          </p>
          <p className="mt-2">
            You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.
          </p>
          <p className="mt-2">
            You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">3. Intellectual Property</h2>
          <p>
            The Service and its original content, features, and functionality are and will remain the exclusive property of 
            Social Media Analytics Platform and its licensors. The Service is protected by copyright, trademark, and other laws.
          </p>
          <p className="mt-2">
            Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of Social Media Analytics Platform.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">4. User Content</h2>
          <p>
            Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, 
            videos, or other material ("Content"). You are responsible for the Content that you post on or through the Service, 
            including its legality, reliability, and appropriateness.
          </p>
          <p className="mt-2">
            By posting Content on or through the Service, you represent and warrant that: (i) the Content is yours (you own it) 
            or you have the right to use it and grant us the rights and license as provided in these Terms, and (ii) the posting 
            of your Content on or through the Service does not violate the privacy rights, publicity rights, copyrights, contract 
            rights or any other rights of any person.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">5. Social Media Data</h2>
          <p>
            When you connect your social media accounts to our Service, you grant us permission to access, store, and analyze the 
            data from those accounts in accordance with our Privacy Policy. You represent and warrant that you have the necessary 
            rights and permissions to grant us this access.
          </p>
          <p className="mt-2">
            We will use this data solely for the purpose of providing our analytics and prediction services to you. We will not 
            share your social media data with third parties without your consent, except as described in our Privacy Policy.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">6. Predictions and Analytics</h2>
          <p>
            Our Service provides predictions and analytics about social media engagement. These predictions are based on machine 
            learning models and historical data, and while we strive for accuracy, we cannot guarantee the results of any prediction.
          </p>
          <p className="mt-2">
            You acknowledge that our predictions are for informational purposes only and that actual social media engagement may 
            vary significantly from our predictions due to factors outside our control.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">7. Termination</h2>
          <p>
            We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, 
            including without limitation if you breach the Terms.
          </p>
          <p className="mt-2">
            Upon termination, your right to use the Service will immediately cease. If you wish to terminate your account, 
            you may simply discontinue using the Service or contact us to request account deletion.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">8. Limitation of Liability</h2>
          <p>
            In no event shall Social Media Analytics Platform, nor its directors, employees, partners, agents, suppliers, or affiliates, 
            be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, 
            data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the 
            Service; (ii) any conduct or content of any third party on the Service; (iii) any content obtained from the Service; and (iv) 
            unauthorized access, use or alteration of your transmissions or content, whether based on warranty, contract, tort (including 
            negligence) or any other legal theory, whether or not we have been informed of the possibility of such damage.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">9. Disclaimer</h2>
          <p>
            Your use of the Service is at your sole risk. The Service is provided on an "AS IS" and "AS AVAILABLE" basis. The Service is 
            provided without warranties of any kind, whether express or implied, including, but not limited to, implied warranties of 
            merchantability, fitness for a particular purpose, non-infringement or course of performance.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">10. Governing Law</h2>
          <p>
            These Terms shall be governed and construed in accordance with the laws, without regard to its conflict of law provisions.
          </p>
          <p className="mt-2">
            Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. If any 
            provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these Terms 
            will remain in effect.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">11. Changes to Terms</h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material 
            we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change 
            will be determined at our sole discretion.
          </p>
          <p className="mt-2">
            By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms. 
            If you do not agree to the new terms, please stop using the Service.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">12. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at:
          </p>
          <p className="mt-2">
            <strong>Email:</strong> terms@socialmediaanalytics.com
          </p>
        </div>
      </div>
    </Layout>
  );
}