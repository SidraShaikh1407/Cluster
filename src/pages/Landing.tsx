import HeroSection from "@/components/HeroSection";
import FileUpload from "@/components/FileUpload";

const Landing = () => {
  return (
    <>
      <HeroSection />
      <div id="upload-section">
        <FileUpload onFileUpload={() => {}} userId={null} />
      </div>
    </>
  );
};

export default Landing;
