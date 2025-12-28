import Header from "../components/Header";
import CreateAdForm from "../components/CreateAdForm";

export default function CreateAdPage() {
  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8 pb-24 md:pb-8">
        <CreateAdForm />
      </main>
    </>
  );
}


