// src/components/common/Footer.tsx

const Footer = () => {
  return (
    <footer className="w-full bg-dark-text text-white p-4 text-center mt-auto">
      <p>
        &copy; {new Date().getFullYear()} CampusBookEx - All Rights Reserved
      </p>
    </footer>
  );
};

export default Footer;
