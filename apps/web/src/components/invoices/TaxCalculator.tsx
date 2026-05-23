export function TaxCalculator() {
  const subtotal = 22100;
  const tax = 1768;
  const discount = 1000;
  const total = subtotal + tax - discount;

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-zinc-950">Totals</h2>
      <div className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between text-zinc-600"><span>Subtotal</span><span>${subtotal.toLocaleString()}</span></div>
        <div className="flex justify-between text-zinc-600"><span>Tax</span><span>${tax.toLocaleString()}</span></div>
        <div className="flex justify-between text-zinc-600"><span>Discount</span><span>-${discount.toLocaleString()}</span></div>
        <div className="flex justify-between border-t border-zinc-200 pt-3 text-base font-semibold text-zinc-950"><span>Total</span><span>${total.toLocaleString()}</span></div>
      </div>
    </section>
  );
}

export default TaxCalculator;
