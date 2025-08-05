import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Terms() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Terms of Use</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">Acceptance of Terms</h2>
            <p>
              By using Teams2Go Service Desk, you agree to be bound by these terms of use. 
              If you do not agree to these terms, please do not use the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Service Description</h2>
            <p>
              Teams2Go Service Desk is a Microsoft Teams application that allows users to 
              create service desk tickets from conversation data within Teams.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">User Responsibilities</h2>
            <p>
              Users are responsible for ensuring they have appropriate permissions to export 
              conversation data and create service desk tickets. Users must comply with their 
              organization's policies and applicable laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Limitation of Liability</h2>
            <p>
              The service is provided "as is" without warranty of any kind. We shall not be 
              liable for any damages arising from the use of this service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Continued use of the 
              service constitutes acceptance of any changes.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}