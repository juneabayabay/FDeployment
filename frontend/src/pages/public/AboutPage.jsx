import { FaCheck, FaBookOpen, FaInfoCircle } from 'react-icons/fa';
import {
  CLINIC_HOURS,
  CLINIC_MISSION,
  CLINIC_STORY,
  CLINIC_VISION,
  DENTAL_SERVICES,
} from '../../config/publicContent';

export default function AboutPage() {
  return (
    <main className="public-container public-inner-page">
      <header className="public-page-header">
        <h1>
          About <span>Barnabas Dental</span>
        </h1>
        <p>Our story, mission, vision, and the services we offer</p>
      </header>

      <div className="public-grid-2">
        <section className="public-card">
          <div className="public-card-title">
            <FaInfoCircle aria-hidden />
            Our mission
          </div>
          <div className="public-prose">
            <p>{CLINIC_MISSION}</p>
          </div>
        </section>

        <section className="public-card">
          <div className="public-card-title">
            <FaInfoCircle aria-hidden />
            Our vision
          </div>
          <div className="public-prose">
            <p>{CLINIC_VISION}</p>
          </div>
        </section>
      </div>

      <section className="public-card" style={{ marginBottom: '2rem' }}>
        <div className="public-card-title">
          <FaBookOpen aria-hidden />
          Our story
        </div>
        <div className="public-prose">
          {CLINIC_STORY.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
          <p>
            <strong>Clinic hours:</strong> {CLINIC_HOURS.days}, {CLINIC_HOURS.open} –{' '}
            {CLINIC_HOURS.close} (lunch {CLINIC_HOURS.lunch})
          </p>
        </div>
      </section>

      <section className="public-card" id="services">
        <div className="public-card-title">
          <FaInfoCircle aria-hidden />
          Dental services
        </div>
        <p className="public-prose">
          We offer a full range of preventive, restorative, and cosmetic procedures.
        </p>
        <ul className="public-service-list">
          {DENTAL_SERVICES.map((service) => (
            <li key={service} className="public-service-item">
              <FaCheck aria-hidden />
              {service}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
