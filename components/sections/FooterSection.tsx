'use client';

import { Heart, Phone, Mail, MapPin, Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import Link from 'next/link';

const footerLinks = {
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Contact Us', href: '/contact' },
    { name: 'Media', href: '/media' },
    { name: 'Blog', href: '/blog' }
  ],
  services: [
    { name: 'Join Our Team', href: '/careers' },
    { name: 'Vendors', href: '/vendors' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Terms & Conditions', href: '/terms' }
  ]
};

const socialLinks = [
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Youtube, href: '#', label: 'YouTube' }
];

export default function FooterSection() {
  return (
    <footer className="bg-gradient-to-br from-gold via-gold-400 to-gold-500 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 indian-pattern opacity-20" />

      <div className="container mx-auto px-6 py-16 relative z-10">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <Heart className="w-6 h-6 text-gold" />
              </div>
              <div>
                <h3 className="text-2xl font-serif font-bold text-white">Forever & Co.</h3>
                <p className="text-xs text-white/80 uppercase tracking-wider">Your One-Stop Wedding Wonderland</p>
              </div>
            </div>
            <p className="text-white/90 mb-6 max-w-md">
              Creating magical wedding experiences with our comprehensive e-commerce platform. 
              From planning to execution, we make your dream wedding a stress-free reality.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-white/90">
                <Phone className="w-4 h-4" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center space-x-3 text-white/90">
                <Mail className="w-4 h-4" />
                <span>hello@forevernco.com</span>
              </div>
              <div className="flex items-center space-x-3 text-white/90">
                <MapPin className="w-4 h-4" />
                <span>Mumbai, Delhi, Bangalore</span>
              </div>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-6">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-white/80 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-6">Services</h4>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-white/80 hover:text-white transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            {/* Copyright */}
            <p className="text-white/80 text-sm mb-4 md:mb-0">
              © 2024 Forever N Co. All rights reserved.
            </p>

            {/* Social Links */}
            <div className="flex items-center space-x-4">
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </Link>
              ))}
            </div>

            {/* WedDiaries Logo */}
            <div className="text-white font-serif text-xl font-bold">
              WedDiaries
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}