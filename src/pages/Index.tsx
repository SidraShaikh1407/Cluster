import { useState } from 'react';
import HeroSection from '@/components/HeroSection';
import FileUpload from '@/components/FileUpload';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';

const Index = () => {
  const [customerData, setCustomerData] = useState<any[]>([]);

  const handleFileUpload = (data: any[]) => {
    setCustomerData(data);
  };

  return (
    <div className="min-h-screen">
      <HeroSection />
      <FileUpload onFileUpload={handleFileUpload} />
      <AnalyticsDashboard data={customerData} />
    </div>
  );
};

export default Index;
