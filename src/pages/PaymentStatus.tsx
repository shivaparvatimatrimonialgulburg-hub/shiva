import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { paymentService } from '@/services/paymentService';
import { useAuth } from '@/hooks/useAuth';

export default function PaymentStatus() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const transactionId = searchParams.get('id');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!transactionId) {
        setStatus('failed');
        setErrorDetails('Transaction ID is missing.');
        return;
      }

      try {
        const data = await paymentService.checkTransactionStatus(transactionId);
        // PhonePe status codes: PENDING, FAILED, COMPLETED
        if (data.state === 'COMPLETED' || data.code === 'PAYMENT_SUCCESS' || data.status === 'COMPLETED' || data.mock) {
          setStatus('success');
          refreshProfile();
        } else {
          setStatus('failed');
          setErrorDetails(data.message || data.error || 'The payment was not successful.');
        }
      } catch (error: any) {
        console.error("Verification error:", error);
        setStatus('failed');
        setErrorDetails(error.message || 'An unexpected error occurred during verification.');
      }
    };

    verifyPayment();
  }, [transactionId]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 bg-muted/30">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Card className="text-center shadow-xl border-none">
          <CardHeader>
            <div className="flex justify-center mb-4">
              {status === 'loading' && <Loader2 className="h-16 w-16 text-primary animate-spin" />}
              {status === 'success' && <CheckCircle2 className="h-16 w-16 text-green-500" />}
              {status === 'failed' && <XCircle className="h-16 w-16 text-destructive" />}
            </div>
            <CardTitle className="text-2xl font-serif font-bold">
              {status === 'loading' && 'Verifying Payment...'}
              {status === 'success' && 'Payment Successful!'}
              {status === 'failed' && 'Payment Failed'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">
              {status === 'success' && 'Your account has been upgraded successfully. You can now access premium features.'}
              {status === 'failed' && (
                <>
                  {errorDetails || 'Something went wrong with your transaction. Please try again or contact support.'}
                </>
              )}
              {transactionId && <span className="block mt-2 text-xs font-mono opacity-70">Transaction ID: {transactionId}</span>}
            </p>
            <div className="flex flex-col gap-3">
              <Button onClick={() => navigate('/dashboard')} className="w-full bg-primary">
                Go to Dashboard
              </Button>
              <Button variant="outline" onClick={() => navigate('/')} className="w-full">
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
