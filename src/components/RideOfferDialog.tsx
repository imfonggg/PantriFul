import { Link } from "@tanstack/react-router";
import { BusFront } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useLanguage } from "./LanguageProvider";

/** Shown when a search signals a transportation need, for example "no car, need groceries tonight". */
export function RideOfferDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (value: boolean) => void }) {
  const { t } = useLanguage();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] rounded-lg" closeLabel={t("Close")}>
        <BusFront className="size-8 text-green" />
        <DialogTitle>{t("Need a ride to get groceries?")}</DialogTitle>
        <DialogDescription>
          {t("PantriFul can arrange an Empower ride to the food location you choose. Approved riders pay $0 — donors cover the driver payment.")}
        </DialogDescription>
        <Button asChild>
          <Link to="/ride-assistance" hash="funded-booking" onClick={() => onOpenChange(false)}>
            {t("Book a Ride with Empower")}
          </Link>
        </Button>
        <Button variant="ghost" onClick={() => onOpenChange(false)}>
          {t("Continue Browsing")}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
