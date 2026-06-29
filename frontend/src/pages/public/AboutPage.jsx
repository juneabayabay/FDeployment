import { FaCheck, FaInfoCircle } from 'react-icons/fa';
import { CLINIC_HOURS, DENTAL_SERVICES } from '../../config/publicContent';

export default function AboutPage() {
  return (
    <div className="public-inner-page">
      <header className="public-page-header">
        <h1>
          About <span>Barnabas Dental</span>
        </h1>
        <p>Our mission, vision, and the services we offer</p>
      </header>

      <div className="public-grid-2">
        <section className="public-card">
          <div className="public-card-title">
            <FaInfoCircle aria-hidden />
            Our mission
          </div>
          <div className="public-prose">
            <p>
              To provide compassionate, high-quality dental care that helps every patient achieve
              a healthy, confident smile — delivered with professionalism and respect.
            </p>
          </div>
        </section>

        <section className="public-card">
          <div className="public-card-title">
            <FaInfoCircle aria-hidden />
            Our vision
          </div>
          <div className="public-prose">
            <p>
              To be the trusted neighborhood dental clinic where families feel welcome, informed,
              and well cared for — combining modern dentistry with convenient digital services.
            </p>
          </div>
        </section>
      </div>

      <section className="public-card" style={{ marginBottom: '2rem' }}>
        <div className="public-card-title">
          <FaInfoCircle aria-hidden />
          Background
        </div>
        <div className="public-prose">
          <p>
            Barnabas Dental Clinic has served our community with general and specialized dental
            services for years. Our team of experienced dentists and staff are committed to patient
            comfort, clear communication, and evidence-based treatment. With our online patient
            portal, you can register, book appointments, and manage your dental care from anywhere.
          </p>
          <p>
            Clinic hours: {CLINIC_HOURS.days}, {CLINIC_HOURS.open} – {CLINIC_HOURS.close} (lunch{' '}
            {CLINIC_HOURS.lunch})
          </p>
        </div>
      </section>

      <section className="public-card">
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
    </div>
  );
}
