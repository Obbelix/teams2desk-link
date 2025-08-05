import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Privacy() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Privacy Policy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">Information We Collect</h2>
            <p>
              Teams2Go Service Desk collects and processes conversation data from Microsoft Teams 
              to create service desk tickets. This includes message content, sender information, 
              and timestamps necessary for ticket creation.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">How We Use Your Information</h2>
            <p>
              The information collected is used solely for creating service desk tickets and 
              improving the service. We do not share your data with third parties except as 
              necessary to provide the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Data Security</h2>
            <p>
              We implement appropriate security measures to protect your information against 
              unauthorized access, alteration, disclosure, or destruction.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Contact Us</h2>
            <p>
              If you have any questions about this privacy policy, please contact us through 
              your service desk system.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}