import {useEffect, useState} from 'react';
import type {
  ActivityCategory,
  ActivityLogItem,
  BnccEvent,
  ContactPersonInfo,
  CpEditRequest,
  DealResult,
  MeetingScheduleItem,
  MouTemplate,
  PartnerRecord,
  PrototypeWorkspaceData,
  UserAccount,
} from '../../types/database';
import {
  addDaysIso,
  formatRupiah,
  getNowWibLabel,
  getTodayIso,
  TIMELINE_STEPS,
} from '../../utils/pipeline';
import {ActivityLogView} from './ActivityLogView';
import {DashboardOverview} from './DashboardOverview';
import {EditApprovalView} from './EditApprovalView';
import {MouTemplateView} from './MouTemplateView';
import {NewEventModal} from './NewEventModal';
import {PartnerDetailModal} from './PartnerDetailModal';
import {ProposalFormView} from './ProposalFormView';
import {Sidebar, type WorkspaceView} from './Sidebar';
import {SponsorshipListView} from './SponsorshipListView';
import {SpreadsheetImportView} from './SpreadsheetImportView';

interface WorkspaceAppProps {
  user: UserAccount;
  workspace: PrototypeWorkspaceData;
  onUpdateWorkspace: (next: PrototypeWorkspaceData) => void;
  onResetDemoData: () => void;
  onLogout: () => void;
}

export function WorkspaceApp({
  user,
  workspace,
  onUpdateWorkspace,
  onResetDemoData,
  onLogout,
}: WorkspaceAppProps) {
  const isManager = user.role === 'admin';
  const [activeEventId, setActiveEventId] = useState<string>(
    workspace.events[0]?.id ?? 'evt-techspire-2026'
  );
  const [activeView, setActiveView] = useState<WorkspaceView>('dashboard');
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [showNewEventModal, setShowNewEventModal] = useState(false);

  useEffect(() => {
    window.scrollTo({top: 0, left: 0, behavior: 'instant'});
  }, [activeView]);

  const activeEvent =
    workspace.events.find((e) => e.id === activeEventId) ??
    workspace.events[0] ?? {
      id: 'evt-techspire-2026',
      name: 'BNCC TechSpire 2026',
      period: 'Desember 2026',
      targetSponsors: 10,
      status: 'Aktif' as const,
    };

  const eventPartners = workspace.partners.filter((p) => p.eventId === activeEvent.id);
  const eventTemplates = workspace.mouTemplates.filter((t) => t.eventId === activeEvent.id);
  const eventEditRequests = workspace.editRequests.filter(
    (r) => r.eventId === activeEvent.id
  );
  const eventLogs = workspace.activityLogs.filter((l) => l.eventId === activeEvent.id);
  const pendingApprovalCount = eventEditRequests.filter((r) => r.status === 'Pending').length;

  const selectedPartner =
    workspace.partners.find((p) => p.id === selectedPartnerId) ?? null;

  const appendLog = (
    category: ActivityCategory,
    title: string,
    description: string,
    companyName?: string,
    redactedDescription?: string
  ): ActivityLogItem => ({
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    eventId: activeEvent.id,
    category,
    title,
    description,
    redactedDescription,
    timestamp: getNowWibLabel(),
    actorName: user.name,
    actorRole: user.title,
    companyName,
  });

  const handleSelectView = (view: WorkspaceView) => {
    if (view === 'edit-approvals' && !isManager) {
      return;
    }
    setActiveView(view);
  };

  const handleMarkFollowUpDone = (partnerId: string) => {
    const target = workspace.partners.find((p) => p.id === partnerId);
    if (!target) return;

    const nowLabel = getNowWibLabel();
    const markingD3 = !target.followUpD3Done;
    const nextStep = markingD3 ? Math.max(target.currentStep, 2) : Math.max(target.currentStep, 3);
    const nextStatus = markingD3 ? 'Follow-Up D+7' : 'Menunggu Respons Company';

    const updatedPartners = workspace.partners.map((p) =>
      p.id === partnerId
        ? {
            ...p,
            followUpD3Done: true,
            followUpD7Done: markingD3 ? p.followUpD7Done : true,
            deadlineD7: markingD3 ? addDaysIso(getTodayIso(), 4) : p.deadlineD7,
            currentStep: nextStep,
            pipelineStatus: nextStatus,
            history: [
              {
                id: `h-${Date.now()}`,
                title: markingD3 ? 'Follow-up D+3 Selesai' : 'Follow-up D+7 Selesai',
                description: 'Pengurus menyelesaikan follow-up dari daftar reminder.',
                timestamp: nowLabel,
                actor: `${user.name} (${user.title})`,
              },
              ...p.history,
            ],
          }
        : p
    );

    const newLog = appendLog(
      'Proposal & Pipeline',
      `Menyelesaikan ${markingD3 ? 'Follow-Up D+3' : 'Follow-Up D+7'}`,
      `Follow-up untuk ${target.companyName} ditandai selesai dan berlanjut ke tahap ${nextStatus}.`,
      target.companyName
    );

    onUpdateWorkspace({
      ...workspace,
      partners: updatedPartners,
      activityLogs: [newLog, ...workspace.activityLogs],
    });
  };

  const handleSaveNewProposal = (newPartner: PartnerRecord) => {
    const newLog = appendLog(
      'Proposal & Pipeline',
      'Menambahkan Proposal Baru',
      `Menambahkan proposal ${newPartner.companyName} ke event ${activeEvent.name} (D+3: ${newPartner.deadlineD3}, D+7: ${newPartner.deadlineD7}).`,
      newPartner.companyName
    );

    onUpdateWorkspace({
      ...workspace,
      partners: [newPartner, ...workspace.partners],
      activityLogs: [newLog, ...workspace.activityLogs],
    });
    setActiveView('sponsorship');
  };

  const handleUpdateProgress = (
    partnerId: string,
    nextStep: number,
    deadline: string,
    note: string
  ) => {
    const target = workspace.partners.find((p) => p.id === partnerId);
    if (!target) return;

    const stepDef = TIMELINE_STEPS[Math.max(0, Math.min(8, nextStep - 1))];
    const nowLabel = getNowWibLabel();

    const updatedPartners = workspace.partners.map((p) =>
      p.id === partnerId
        ? {
            ...p,
            currentStep: nextStep,
            pipelineStatus: stepDef.label,
            followUpD3Done: nextStep >= 2 ? true : p.followUpD3Done,
            followUpD7Done: nextStep >= 3 ? true : p.followUpD7Done,
            deadlineD7: deadline || p.deadlineD7,
            notes: note,
            history: [
              {
                id: `h-${Date.now()}`,
                title: `Progress ke Tahap ${nextStep}: ${stepDef.label}`,
                description: note,
                timestamp: nowLabel,
                actor: `${user.name} (${user.title})`,
              },
              ...p.history,
            ],
          }
        : p
    );

    const newLog = appendLog(
      'Proposal & Pipeline',
      `Update Pipeline ${target.companyName}`,
      `Tahap diperbarui ke ${stepDef.label}: ${note}`,
      target.companyName
    );

    onUpdateWorkspace({
      ...workspace,
      partners: updatedPartners,
      activityLogs: [newLog, ...workspace.activityLogs],
    });
  };

  const handleAddMeeting = (partnerId: string, meeting: MeetingScheduleItem) => {
    const target = workspace.partners.find((p) => p.id === partnerId);
    if (!target) return;

    const nowLabel = getNowWibLabel();
    const updatedPartners = workspace.partners.map((p) =>
      p.id === partnerId
        ? {
            ...p,
            currentStep: Math.max(p.currentStep, 5),
            pipelineStatus: p.currentStep < 5 ? 'Schedule meeting' : p.pipelineStatus,
            meetings: [meeting, ...p.meetings],
            history: [
              {
                id: `h-${Date.now()}`,
                title: `Meeting ${meeting.method} Dijadwalkan`,
                description: `${meeting.date} ${meeting.time} WIB — ${meeting.address}`,
                timestamp: nowLabel,
                actor: `${user.name} (${user.title})`,
              },
              ...p.history,
            ],
          }
        : p
    );

    const newLog = appendLog(
      'Proposal & Pipeline',
      `Menjadwalkan Meeting ${target.companyName}`,
      `Meeting ${meeting.method} pada ${meeting.date} pukul ${meeting.time} WIB.`,
      target.companyName
    );

    onUpdateWorkspace({
      ...workspace,
      partners: updatedPartners,
      activityLogs: [newLog, ...workspace.activityLogs],
    });
  };

  const handleSavePitching = (
    partnerId: string,
    payload: {
      meetingSummary: string;
      grade: string;
      sponsorshipValue: number;
      result: DealResult;
      rejectionReason?: string;
    }
  ) => {
    if (!isManager) return;
    const target = workspace.partners.find((p) => p.id === partnerId);
    if (!target) return;

    const nowLabel = getNowWibLabel();
    const nextStep = payload.result === 'Accept' ? Math.max(target.currentStep, 8) : target.currentStep;
    const nextPipelineStatus =
      payload.result === 'Accept'
        ? 'Grading & MoU'
        : payload.result === 'Decline'
          ? 'Decline (Arsip)'
          : target.pipelineStatus;

    const updatedPartners = workspace.partners.map((p) =>
      p.id === partnerId
        ? {
            ...p,
            meetingSummary: payload.meetingSummary,
            grade: payload.grade,
            sponsorshipValue: payload.sponsorshipValue,
            result: payload.result,
            rejectionReason: payload.rejectionReason,
            currentStep: nextStep,
            pipelineStatus: nextPipelineStatus,
            mouStatus: payload.result === 'Accept' && p.mouStatus === 'Belum Dibuat' ? 'Siap Dibuat' : p.mouStatus,
            history: [
              {
                id: `h-${Date.now()}`,
                title: `Keputusan Pitching: ${payload.result}`,
                description:
                  payload.result === 'Decline'
                    ? `Alasan: ${payload.rejectionReason}`
                    : `Grade ${payload.grade} (${formatRupiah(payload.sponsorshipValue)})`,
                timestamp: nowLabel,
                actor: `${user.name} (${user.title})`,
              },
              ...p.history,
            ],
          }
        : p
    );

    const newLog = appendLog(
      'Pitching & MoU',
      `Keputusan Pitching ${target.companyName}: ${payload.result}`,
      payload.result === 'Decline'
        ? `${target.companyName} ditandai Decline. Alasan: ${payload.rejectionReason}`
        : `${target.companyName} disetujui (${payload.result}) paket ${payload.grade} — ${formatRupiah(
            payload.sponsorshipValue
          )}.`,
      target.companyName,
      payload.result === 'Decline'
        ? `${target.companyName} ditandai Decline. Alasan: ${payload.rejectionReason}`
        : `${target.companyName} disetujui (${payload.result}) pada paket kerja sama.`
    );

    onUpdateWorkspace({
      ...workspace,
      partners: updatedPartners,
      activityLogs: [newLog, ...workspace.activityLogs],
    });
  };

  const handleToggleBenefit = (partnerId: string, benefitId: string) => {
    const updatedPartners = workspace.partners.map((p) =>
      p.id === partnerId
        ? {
            ...p,
            benefits: p.benefits.map((b) =>
              b.id === benefitId ? {...b, completed: !b.completed} : b
            ),
          }
        : p
    );
    onUpdateWorkspace({...workspace, partners: updatedPartners});
  };

  const handleAddBenefit = (partnerId: string, label: string) => {
    if (!isManager) return;
    const updatedPartners = workspace.partners.map((p) =>
      p.id === partnerId
        ? {
            ...p,
            benefits: [
              ...p.benefits,
              {id: `ben-${Date.now()}`, label, completed: false},
            ],
          }
        : p
    );
    onUpdateWorkspace({...workspace, partners: updatedPartners});
  };

  const handleSubmitCpEdit = (partnerId: string, newCp: ContactPersonInfo) => {
    const target = workspace.partners.find((p) => p.id === partnerId);
    if (!target) return;

    const nowLabel = getNowWibLabel();

    if (isManager) {
      const updatedPartners = workspace.partners.map((p) =>
        p.id === partnerId
          ? {
              ...p,
              contactPerson: newCp,
              history: [
                {
                  id: `h-${Date.now()}`,
                  title: 'Contact Person Diperbarui',
                  description: `CP diperbarui langsung menjadi ${newCp.name} (${newCp.contact}).`,
                  timestamp: nowLabel,
                  actor: `${user.name} (${user.title})`,
                },
                ...p.history,
              ],
            }
          : p
      );

      const newLog = appendLog(
        'Contact Person',
        'Memperbarui Contact Person',
        `Manager memperbarui CP ${target.companyName} menjadi ${newCp.name} (${newCp.contact}).`,
        target.companyName
      );

      onUpdateWorkspace({
        ...workspace,
        partners: updatedPartners,
        activityLogs: [newLog, ...workspace.activityLogs],
      });
    } else {
      const newReq: CpEditRequest = {
        id: `req-${Date.now()}`,
        eventId: target.eventId,
        partnerId: target.id,
        companyName: target.companyName,
        requestTitle: 'Pembaruan Contact Person (Pengajuan Staff)',
        requestedBy: `${user.name} (${user.title})`,
        requestedAt: nowLabel,
        status: 'Pending',
        oldCp: target.contactPerson,
        newCp,
      };

      const newLog = appendLog(
        'Contact Person',
        'Mengajukan Pembaruan CP',
        `Mengajukan perubahan CP ${target.companyName} ke ${newCp.name} (${newCp.contact}) — Menunggu Persetujuan Manager.`,
        target.companyName
      );

      onUpdateWorkspace({
        ...workspace,
        editRequests: [newReq, ...workspace.editRequests],
        activityLogs: [newLog, ...workspace.activityLogs],
      });
    }
  };

  const handleApproveEditRequest = (requestId: string) => {
    if (!isManager) return;
    const req = workspace.editRequests.find((r) => r.id === requestId);
    if (!req) return;

    const nowLabel = getNowWibLabel();
    const updatedRequests = workspace.editRequests.map((r) =>
      r.id === requestId
        ? {
            ...r,
            status: 'Approved' as const,
            decidedBy: `${user.name} (${user.title})`,
            decidedAt: nowLabel,
          }
        : r
    );

    const updatedPartners = workspace.partners.map((p) =>
      p.id === req.partnerId
        ? {
            ...p,
            contactPerson: req.newCp,
            history: [
              {
                id: `h-${Date.now()}`,
                title: 'Pembaruan CP Disetujui Manager',
                description: `CP diperbarui ke ${req.newCp.name} (${req.newCp.contact}).`,
                timestamp: nowLabel,
                actor: `${user.name} (${user.title})`,
              },
              ...p.history,
            ],
          }
        : p
    );

    const newLog = appendLog(
      'Contact Person',
      'Menyetujui Pembaruan CP',
      `Menyetujui perubahan CP ${req.companyName} dari ${req.requestedBy}.`,
      req.companyName
    );

    onUpdateWorkspace({
      ...workspace,
      editRequests: updatedRequests,
      partners: updatedPartners,
      activityLogs: [newLog, ...workspace.activityLogs],
    });
  };

  const handleRejectEditRequest = (requestId: string, reason: string) => {
    if (!isManager) return;
    const req = workspace.editRequests.find((r) => r.id === requestId);
    if (!req) return;

    const nowLabel = getNowWibLabel();
    const updatedRequests = workspace.editRequests.map((r) =>
      r.id === requestId
        ? {
            ...r,
            status: 'Rejected' as const,
            rejectionReason: reason,
            decidedBy: `${user.name} (${user.title})`,
            decidedAt: nowLabel,
          }
        : r
    );

    const newLog = appendLog(
      'Contact Person',
      'Menolak Pembaruan CP',
      `Menolak perubahan CP ${req.companyName}. Alasan: ${reason}`,
      req.companyName
    );

    onUpdateWorkspace({
      ...workspace,
      editRequests: updatedRequests,
      activityLogs: [newLog, ...workspace.activityLogs],
    });
  };

  const handleSaveMouTemplate = (template: MouTemplate) => {
    if (!isManager) return;
    const exists = workspace.mouTemplates.some((t) => t.id === template.id);
    const updatedTemplates = exists
      ? workspace.mouTemplates.map((t) => (t.id === template.id ? template : t))
      : [template, ...workspace.mouTemplates];

    const newLog = appendLog(
      'Pitching & MoU',
      exists ? 'Memperbarui Template MoU' : 'Membuat Template MoU Baru',
      `Template "${template.title}" disimpan untuk ${activeEvent.name}.`
    );

    onUpdateWorkspace({
      ...workspace,
      mouTemplates: updatedTemplates,
      activityLogs: [newLog, ...workspace.activityLogs],
    });
  };

  const handleFinalizeMou = (partnerId: string, templateId: string) => {
    if (!isManager) return;
    const target = workspace.partners.find((p) => p.id === partnerId);
    if (!target) return;

    const nowLabel = getNowWibLabel();
    const updatedPartners = workspace.partners.map((p) =>
      p.id === partnerId
        ? {
            ...p,
            currentStep: 9,
            pipelineStatus: 'MoU Selesai',
            mouStatus: 'Selesai' as const,
            mouTemplateId: templateId,
            mouGeneratedAt: getTodayIso(),
            history: [
              {
                id: `h-${Date.now()}`,
                title: 'MoU Selesai Difinalisasi',
                description: `Dokumen MoU untuk ${p.companyName} ditandai selesai.`,
                timestamp: nowLabel,
                actor: `${user.name} (${user.title})`,
              },
              ...p.history,
            ],
          }
        : p
    );

    const newLog = appendLog(
      'Pitching & MoU',
      'MoU Selesai Difinalisasi',
      `Dokumen MoU ${target.grade} ${target.companyName} (${formatRupiah(
        target.sponsorshipValue
      )}) telah difinalisasi.`,
      target.companyName,
      `Dokumen MoU ${target.companyName} telah difinalisasi.`
    );

    onUpdateWorkspace({
      ...workspace,
      partners: updatedPartners,
      activityLogs: [newLog, ...workspace.activityLogs],
    });
  };

  const handleImportPartners = (newPartners: PartnerRecord[]) => {
    const newLog = appendLog(
      'Impor & Handover',
      `Impor ${newPartners.length} Proposal dari Spreadsheet`,
      `Mengimpor ${newPartners.length} partner baru ke ${activeEvent.name} dengan reminder D+3 & D+7 otomatis.`
    );

    onUpdateWorkspace({
      ...workspace,
      partners: [...newPartners, ...workspace.partners],
      activityLogs: [newLog, ...workspace.activityLogs],
    });
  };

  const handleCreateEvent = (newEvent: BnccEvent) => {
    if (!isManager) return;
    const defaultTpl: MouTemplate = {
      id: `mou-tpl-${Date.now()}`,
      eventId: newEvent.id,
      title: `Template MoU Sponsorship Utama — ${newEvent.name}`,
      type: 'Sponsorship',
      updatedAt: getTodayIso(),
      body: `PERJANJIAN KERJA SAMA SPONSORSHIP\nACARA {{event}} — BINA NUSANTARA COMPUTER CLUB (BNCC)\n\nTanggal: {{tanggal}}\nPerusahaan: {{nama_company}}\nContact Person: {{cp}} ({{jabatan_cp}})\nPaket & Nilai: {{nilai}}\n\nDaftar Benefit:\n{{benefit}}`,
    };

    const newLog: ActivityLogItem = {
      id: `log-${Date.now()}`,
      eventId: newEvent.id,
      category: 'Proposal & Pipeline',
      title: 'Membuat Event Baru',
      description: `Event ${newEvent.name} (${newEvent.period}) dibuat dengan template MoU awal.`,
      timestamp: getNowWibLabel(),
      actorName: user.name,
      actorRole: user.title,
    };

    onUpdateWorkspace({
      ...workspace,
      events: [newEvent, ...workspace.events],
      mouTemplates: [defaultTpl, ...workspace.mouTemplates],
      activityLogs: [newLog, ...workspace.activityLogs],
    });
    setActiveEventId(newEvent.id);
    setShowNewEventModal(false);
  };

  return (
    <div className="min-h-screen bg-[#F3F8FD] text-[#1E1E1E] lg:flex">
      <Sidebar
        user={user}
        events={workspace.events}
        activeEventId={activeEvent.id}
        onSelectEvent={(evtId) => {
          setActiveEventId(evtId);
          setSelectedPartnerId(null);
        }}
        activeView={activeView}
        onSelectView={handleSelectView}
        pendingApprovalCount={pendingApprovalCount}
        onLogout={onLogout}
        onResetDemoData={onResetDemoData}
      />

      <main className="flex-1 min-w-0 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-7">
        <div className="mx-auto max-w-[1160px]">
          {activeView === 'dashboard' && (
            <DashboardOverview
              user={user}
              events={workspace.events}
              activeEvent={activeEvent}
              partners={eventPartners}
              onSelectEvent={setActiveEventId}
              onNavigate={handleSelectView}
              onOpenNewEventModal={() => setShowNewEventModal(true)}
              onOpenPartnerDetail={setSelectedPartnerId}
              onMarkFollowUpDone={handleMarkFollowUpDone}
            />
          )}

          {activeView === 'sponsorship' && (
            <SponsorshipListView
              user={user}
              activeEvent={activeEvent}
              partners={eventPartners}
              onOpenNewProposal={() => setActiveView('proposal-new')}
              onOpenPartnerDetail={setSelectedPartnerId}
            />
          )}

          {activeView === 'proposal-new' && (
            <ProposalFormView
              user={user}
              activeEvent={activeEvent}
              onCancel={() => setActiveView('sponsorship')}
              onSaveProposal={handleSaveNewProposal}
            />
          )}

          {activeView === 'mou-templates' && (
            <MouTemplateView
              user={user}
              activeEvent={activeEvent}
              templates={eventTemplates}
              partners={eventPartners}
              onSaveTemplate={handleSaveMouTemplate}
              onFinalizeMou={handleFinalizeMou}
            />
          )}

          {activeView === 'edit-approvals' && isManager && (
            <EditApprovalView
              activeEvent={activeEvent}
              requests={eventEditRequests}
              onApproveRequest={handleApproveEditRequest}
              onRejectRequest={handleRejectEditRequest}
            />
          )}

          {activeView === 'import-spreadsheet' && (
            <SpreadsheetImportView
              user={user}
              activeEvent={activeEvent}
              onImportPartners={handleImportPartners}
              onGoToSponsorshipList={() => setActiveView('sponsorship')}
            />
          )}

          {activeView === 'activity-log' && (
            <ActivityLogView
              user={user}
              activeEvent={activeEvent}
              logs={eventLogs}
            />
          )}
        </div>
      </main>

      {selectedPartner && (
        <PartnerDetailModal
          partner={selectedPartner}
          user={user}
          onClose={() => setSelectedPartnerId(null)}
          onUpdateProgress={handleUpdateProgress}
          onAddMeeting={handleAddMeeting}
          onSavePitching={handleSavePitching}
          onToggleBenefit={handleToggleBenefit}
          onAddBenefit={handleAddBenefit}
          onSubmitCpEdit={handleSubmitCpEdit}
        />
      )}

      {showNewEventModal && isManager && (
        <NewEventModal
          onClose={() => setShowNewEventModal(false)}
          onCreateEvent={handleCreateEvent}
        />
      )}
    </div>
  );
}
