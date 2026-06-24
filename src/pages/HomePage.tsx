import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Droplets, Search, Siren, Users, Heart, ArrowRight, Clock,
  MapPin, Activity
} from 'lucide-react';
import { BLOOD_GROUPS, BLOOD_GROUP_INFO, type BloodGroup } from '../types';

const stats = [
  { icon: Users, label: 'Registered Donors', value: '10,000+' },
  { icon: Heart, label: 'Lives Saved', value: '25,000+' },
  { icon: Droplets, label: 'Blood Units', value: '50,000+' },
  { icon: MapPin, label: 'Cities Covered', value: '200+' },
];

const successStories = [
  {
    name: 'Priya S.',
    role: 'Recipient',
    text: 'BloodLink helped me find a matching donor within 30 minutes during a critical emergency. I am alive today because of this platform.',
    bloodGroup: 'O-',
  },
  {
    name: 'Ahmed K.',
    role: 'Donor',
    text: "I registered as a donor and within a week, I was able to help save a child's life. The feeling is indescribable.",
    bloodGroup: 'B+',
  },
  {
    name: 'Sarah M.',
    role: 'Recipient',
    text: 'During my surgery, we needed 3 units of AB+ blood. BloodLink connected us with verified donors who showed up without hesitation.',
    bloodGroup: 'AB+',
  },
];

export default function HomePage() {
  const { user, profile } = useAuth();

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden gradient-hero text-white">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm mb-6">
                <Activity className="w-4 h-4 text-rose-300" />
                <span>Every 2 seconds, someone needs blood</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] mb-6">
                Connecting Donors,<br />
                <span className="text-rose-300">Saving Lives</span>
              </h1>
              <p className="text-lg text-white/80 leading-relaxed mb-8 max-w-lg">
                BloodLink bridges the gap between blood donors and recipients.
                Find compatible donors instantly, create emergency requests, and help
                save lives in your community.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                {!user ? (
                  <>
                    <Link to="/register" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-blood-700 font-bold rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-xl shadow-black/20">
                      <Droplets className="w-5 h-5" />
                      Become a Donor
                    </Link>
                    <Link to="/search" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-200">
                      <Search className="w-5 h-5" />
                      Find Donors
                    </Link>
                  </>
                ) : profile?.role === 'recipient' ? (
                  <Link to="/request/new" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-blood-700 font-bold rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-xl shadow-black/20">
                    <Siren className="w-5 h-5" />
                    Create Blood Request
                  </Link>
                ) : (
                  <Link to="/dashboard" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-blood-700 font-bold rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-xl shadow-black/20">
                    <ArrowRight className="w-5 h-5" />
                    Go to Dashboard
                  </Link>
                )}
              </div>
            </div>

            <div className="hidden md:block">
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Search className="w-5 h-5 text-rose-300" />
                  Quick Donor Search
                </h3>
                <Link to="/search" className="block space-y-4">
                  <div>
                    <label className="text-sm text-white/70 mb-1.5 block">Blood Group</label>
                    <div className="grid grid-cols-4 gap-2">
                      {BLOOD_GROUPS.map(bg => (
                        <div key={bg} className="py-2 rounded-lg bg-white/10 border border-white/10 text-center text-sm font-semibold hover:bg-white/20 transition-colors cursor-pointer">
                          {bg}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-white/70 mb-1.5 block">City</label>
                    <div className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/10 text-white/50 text-sm">
                      Enter your city...
                    </div>
                  </div>
                  <div className="w-full py-3 rounded-xl bg-white text-blood-700 font-bold text-center hover:bg-gray-50 transition-colors">
                    Search Donors
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 80V20C240 60 480 0 720 30C960 60 1200 0 1440 20V80H0Z" className="fill-white dark:fill-gray-950" />
          </svg>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map(({ icon: Icon, label, value }) => (
              <div key={label} className="text-center p-6 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                <Icon className="w-8 h-8 text-blood-600 dark:text-blood-400 mx-auto mb-3" />
                <p className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-white">{value}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">How BloodLink Works</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">A simple process to connect donors with those in need</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Users, title: 'Register', desc: 'Sign up as a donor or recipient. Add your blood group, location, and availability.' },
              { icon: Search, title: 'Search & Request', desc: 'Search for compatible donors by blood group and city, or create an emergency blood request.' },
              { icon: Heart, title: 'Save Lives', desc: 'Connect directly with donors or recipients. Every donation can save up to 3 lives.' },
            ].map(({ icon: Icon, title, desc }, i) => (
              <div key={i} className="card p-8 text-center group hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="w-14 h-14 rounded-2xl bg-blood-50 dark:bg-blood-900/30 flex items-center justify-center mx-auto mb-5 group-hover:bg-blood-100 dark:group-hover:bg-blood-900/50 transition-colors">
                  <Icon className="w-7 h-7 text-blood-600 dark:text-blood-400" />
                </div>
                <div className="w-8 h-8 rounded-full bg-blood-600 text-white flex items-center justify-center mx-auto mb-4 text-sm font-bold">{i + 1}</div>
                <h3 className="text-lg font-bold mb-2">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency CTA */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl gradient-blood p-8 md:p-12 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
            <div className="relative flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-sm mb-4">
                  <Clock className="w-4 h-4" />
                  Time is critical
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Need Blood Urgently?</h2>
                <p className="text-white/80 leading-relaxed max-w-lg">
                  Create an emergency blood request and we'll instantly notify compatible donors in your area.
                  Every minute counts when someone needs blood.
                </p>
              </div>
              <div>
                <Link to={user ? '/request/new' : '/register'} className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-blood-700 font-bold rounded-xl hover:bg-gray-50 transition-all shadow-xl shadow-black/20">
                  <Siren className="w-5 h-5" />
                  Create Emergency Request
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blood Group Info */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Blood Group Compatibility</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">Know which blood types are compatible for donation and transfusion</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(Object.entries(BLOOD_GROUP_INFO) as [BloodGroup, typeof BLOOD_GROUP_INFO[BloodGroup]][]).map(([group, info]) => (
              <div key={group} className="card p-5 group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                <div className="text-2xl font-extrabold text-blood-600 dark:text-blood-400 mb-1">{group}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">{info.percentage} of population</div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-1.5">
                    <ArrowRight className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" />
                    <span className="text-gray-600 dark:text-gray-300"><span className="font-medium">Donates to:</span> {info.canDonateTo}</span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <ArrowRight className="w-3 h-3 text-blue-500 mt-0.5 shrink-0" />
                    <span className="text-gray-600 dark:text-gray-300"><span className="font-medium">Receives from:</span> {info.canReceiveFrom}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-20 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Stories of Hope</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">Real stories from people whose lives were touched by BloodLink</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {successStories.map((story, i) => (
              <div key={i} className="card p-8 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-blood-100 dark:bg-blood-900/40 flex items-center justify-center">
                    <span className="text-sm font-bold text-blood-700 dark:text-blood-400">{story.bloodGroup}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{story.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{story.role}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed italic">"{story.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Droplets className="w-12 h-12 text-blood-600 dark:text-blood-400 mx-auto mb-6" />
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Ready to Make a Difference?</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto mb-8 leading-relaxed">
            Join thousands of donors who are ready to save lives. Your blood could be someone's second chance at life.
          </p>
          {!user ? (
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/register" className="btn-primary text-lg !px-10 !py-4">
                <Droplets className="w-5 h-5" />
                Register as Donor
              </Link>
              <Link to="/login" className="btn-secondary text-lg !px-10 !py-4">
                Sign In
              </Link>
            </div>
          ) : (
            <Link to="/search" className="btn-primary text-lg !px-10 !py-4">
              <Search className="w-5 h-5" />
              Find Donors Now
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
