;
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import {
  Check,
  ArrowRight,
  Sparkles,
  Zap,
  Crown,
  Users,
  MessageSquare,
  Headphones,
  Cog,
  Star,
  Shield,
  Rocket,
} from 'lucide-react';
import GradientOrb from '~/components/gradient-orb';

export const Route = createFileRoute({
  component: PricingComponent,
});

function PricingComponent() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: '',
      description: 'Perfect for getting started with AI development',
      badge: null,
      icon: Star,
      features: [
        'Basic access to AI tools',
        'Limited API usage',
        'Community support',
        'Core starter templates',
        'Basic documentation',
      ],
      buttonText: 'Start Free',
      buttonVariant: 'outline' as const,
      popular: false,
    },
    {
      name: 'Tier 1',
      price: '$350',
      period: '/year',
      description: 'For developers ready to build production apps',
      badge: 'Most Popular',
      icon: Zap,
      features: [
        'All Free tier features',
        'Priority support',
        'Extended usage caps',
        'Advanced templates',
        'Premium documentation',
        'Community Discord access',
        'Monthly office hours',
      ],
      buttonText: 'Start Building',
      buttonVariant: 'default' as const,
      popular: true,
    },
    {
      name: 'Tier 2',
      price: '$8,500',
      period: '/year + setup fee',
      description: 'Enterprise-grade solution with dedicated support',
      badge: 'Enterprise',
      icon: Crown,
      features: [
        'All Tier 1 features',
        'Custom integrations',
        'Dedicated support team',
        'Onboarding & setup assistance',
        'Custom feature development',
        'Priority bug fixes',
        'Direct Slack channel',
        'Monthly strategy calls',
      ],
      buttonText: 'Contact Sales',
      buttonVariant: 'outline' as const,
      popular: false,
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Hero Section */}
      <section className="container relative z-0 mx-auto flex flex-col items-center px-4 pt-20 pb-16 text-center md:pt-32 md:pb-24">
        <GradientOrb className="-translate-x-1/2 absolute top-0 left-1/2 z-[-1] transform" />

        <Badge variant="secondary" className="mb-4 px-4 py-1">
          <Sparkles className="mr-1.5 h-3.5 w-3.5" />
          Simple & Transparent
        </Badge>

        <h1 className="max-w-4xl font-bold text-4xl text-foreground md:text-6xl lg:text-7xl">
          AI Starter SaaS Kit
          <span className="block text-primary">Pricing Plans</span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
          Choose the perfect plan for your AI development journey. From free exploration to enterprise-grade solutions.
        </p>
      </section>

      {/* Pricing Cards */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid gap-8 md:grid-cols-3">
          {plans.map((plan, index) => {
            const IconComponent = plan.icon;
            return (
              <Card 
                key={plan.name} 
                className={`relative transition-all duration-300 hover:shadow-lg ${
                  plan.popular 
                    ? 'border-2 border-primary bg-primary/5 scale-105' 
                    : 'border hover:border-primary/50'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-4 py-1">
                      {plan.badge}
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    <div className={`p-3 rounded-full ${
                      plan.popular ? 'bg-primary/20' : 'bg-muted'
                    }`}>
                      <IconComponent className={`h-8 w-8 ${
                        plan.popular ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                    </div>
                  </div>
                  
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.period && (
                      <span className="text-muted-foreground text-lg">{plan.period}</span>
                    )}
                  </div>
                  
                  <CardDescription className="mt-2 text-base">
                    {plan.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-0">
                  <Button 
                    className="w-full mb-6 rounded-full" 
                    variant={plan.buttonVariant}
                    size="lg"
                  >
                    {plan.buttonText}
                    {plan.buttonVariant === 'default' && (
                      <ArrowRight className="ml-2 h-4 w-4" />
                    )}
                  </Button>

                  <div className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-4">
              Compare Features
            </h2>
            <p className="text-lg text-muted-foreground">
              See what's included in each plan to make the best choice for your needs
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <Users className="mb-2 h-8 w-8 text-primary" />
                <CardTitle>Community Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Get help from our growing community of AI developers
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Free</span>
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex justify-between">
                    <span>Tier 1</span>
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex justify-between">
                    <span>Tier 2</span>
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <Headphones className="mb-2 h-8 w-8 text-primary" />
                <CardTitle>Priority Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Get faster responses and dedicated help when you need it
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Free</span>
                    <span className="text-muted-foreground">—</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tier 1</span>
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex justify-between">
                    <span>Tier 2</span>
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <Cog className="mb-2 h-8 w-8 text-primary" />
                <CardTitle>Custom Integrations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Tailored solutions and custom feature development
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Free</span>
                    <span className="text-muted-foreground">—</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tier 1</span>
                    <span className="text-muted-foreground">—</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tier 2</span>
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-12 text-center text-3xl font-bold tracking-tight md:text-4xl">
            Pricing FAQ
          </h2>

          <div className="space-y-8">
            <div>
              <h3 className="mb-2 text-xl font-semibold">
                Can I upgrade or downgrade my plan anytime?
              </h3>
              <p className="text-muted-foreground">
                Yes! You can upgrade your plan at any time. When you upgrade, you'll be charged the prorated amount for the remaining billing period. Downgrades take effect at the end of your current billing cycle.
              </p>
            </div>

            <div>
              <h3 className="mb-2 text-xl font-semibold">
                What's included in the setup fee for Tier 2?
              </h3>
              <p className="text-muted-foreground">
                The setup fee covers dedicated onboarding, custom configuration, team training, and initial custom integrations. Our team will work with you to ensure the platform is perfectly tailored to your needs.
              </p>
            </div>

            <div>
              <h3 className="mb-2 text-xl font-semibold">
                Do you offer refunds?
              </h3>
              <p className="text-muted-foreground">
                We offer a 30-day money-back guarantee for all paid plans. If you're not satisfied with your purchase, contact us within 30 days for a full refund.
              </p>
            </div>

            <div>
              <h3 className="mb-2 text-xl font-semibold">
                What payment methods do you accept?
              </h3>
              <p className="text-muted-foreground">
                We accept all major credit cards (Visa, MasterCard, American Express) and PayPal. For enterprise accounts, we can also arrange bank transfers and custom billing cycles.
              </p>
            </div>

            <div>
              <h3 className="mb-2 text-xl font-semibold">
                Is there a discount for annual payments?
              </h3>
              <p className="text-muted-foreground">
                Our listed prices are already for annual payments, providing significant savings compared to monthly billing. Contact us for custom enterprise pricing and multi-year discounts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <Card className="mx-auto max-w-2xl border-primary/20 bg-primary/5">
          <CardContent className="flex flex-col items-center p-8 text-center md:p-12">
            <Rocket className="mb-4 h-12 w-12 text-primary" />
            <h2 className="mb-4 text-2xl font-bold md:text-3xl">
              Ready to Start Building?
            </h2>
            <p className="mb-8 text-muted-foreground">
              Join thousands of developers building the future with AI-powered development
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button size="lg" className="rounded-full px-8">
                Start Your Free Trial <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="rounded-full px-8">
                <MessageSquare className="mr-2 h-4 w-4" />
                Talk to Sales
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer Trust Signals */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center gap-6 md:flex-row">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>Enterprise Security</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Headphones className="h-4 w-4" />
            <span>24/7 Support</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>10,000+ Developers</span>
          </div>
        </div>
      </section>
    </div>
  );
}