export default function WelcomeBanner({ name = "Alex" }) {
  return (
    <section className="mb-4">
      <h2 className="fw-bold text-dark display-6 mb-2">
        Chào mừng trở lại, {name}! 👋
      </h2>
      <p className="text-muted lead fs-6">
        Bạn đang làm rất tốt! Hãy tiếp tục duy trì đà học tập của mình hôm nay.
      </p>
    </section>
  );
}